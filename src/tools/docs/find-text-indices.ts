import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const findTextIndices = async (documentId: string, searchText: string, caseSensitive: boolean = false, partialMatch: boolean = true, auth: Auth.OAuth2Client, occurrenceNumber?: number) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const doc = await docs.documents.get({documentId});
    const content = doc.data.body?.content || [];

    const matches: { startIndex: number; endIndex: number; text: string }[] = [];
    const normSearch = caseSensitive ? searchText : searchText.toLowerCase();
    const searchLen = searchText.length;

    const searchInRun = (text: string, runStart: number) => {
        const fullText = caseSensitive ? text : text.toLowerCase();
        let idx = 0;
        while (true) {
            idx = fullText.indexOf(normSearch, idx);
            if (idx === -1) break;
            const zeroBasedStart = runStart + idx;
            const zeroBasedEnd = zeroBasedStart + searchLen;
            matches.push({startIndex: zeroBasedStart, endIndex: zeroBasedEnd, text: text.substr(idx, searchLen)});
            idx += searchLen;
            if (!partialMatch) break;
            if (occurrenceNumber && matches.length >= occurrenceNumber) break;
        }
    };

    const walkElements = (elements: any[]) => {
        for (const elem of elements) {
            if (elem.textRun) {
                const text = elem.textRun.content || '';
                const runStart = elem.startIndex ?? 0;
                if (text) {
                    searchInRun(text, runStart);
                    if (occurrenceNumber && matches.length >= occurrenceNumber) return true;
                }
            }
        }
        return false;
    };

    const walkContent = (elements: any[]) => {
        for (const element of elements) {
            if (element.paragraph) {
                if (walkElements(element.paragraph.elements || [])) return true;
            } else if (element.table) {
                for (const row of element.table.tableRows || []) {
                    for (const cell of row.tableCells || []) {
                        if (walkContent(cell.content || [])) return true;
                    }
                }
            } else if (element.tableOfContents) {
                if (walkContent(element.tableOfContents.content || [])) return true;
            }
        }
        return false;
    };

    walkContent(content);

    if (occurrenceNumber) {
        return matches.slice(occurrenceNumber - 1, occurrenceNumber);
    }

    return matches;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.findTextIndices,
        'Finds all positions of a specific text inside a Google Doc (supports paragraphs, tables, etc)',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            searchText: z.string().describe('The text you want to search for inside the document'),
            caseSensitive: z.boolean().default(false).describe('Whether to match case exactly (default false)'),
            partialMatch: z.boolean().default(true).describe('Whether to allow partial matches (default true)'),
            occurrenceNumber: z.number().int().positive().optional().describe('If provided, returns only the Nth match (1-based); otherwise returns all matches'),
        },
        async ({documentId, searchText, caseSensitive, partialMatch}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const indices = await findTextIndices(documentId, searchText, caseSensitive, partialMatch, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Found ${indices.length} match${indices.length > 1 ? 'es' : ''}:\n\n${indices
                                .map((range, i) => `${i + 1}. startIndex: ${range.startIndex}, endIndex: ${range.endIndex}`)
                                .join('\n')}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to find text indices: ${error}`), 'find-text-indices');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to find text indices ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
