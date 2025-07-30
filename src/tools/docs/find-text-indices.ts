import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface TextMatch {
    startIndex: number;
    endIndex: number;
    text: string;
}

const findTextIndices = async (documentId: string, searchText: string, caseSensitive: boolean, auth: Auth.OAuth2Client): Promise<TextMatch[]> => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const res = await docs.documents.get({documentId});
    const content = res.data.body?.content || [];

    const matches: TextMatch[] = [];
    const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();

    const processElements = (elements: any[]) => {
        for (const element of elements) {
            if (element.paragraph) {
                for (const elem of element.paragraph.elements || []) {
                    if (elem.textRun?.content && elem.startIndex !== undefined && elem.endIndex !== undefined) {
                        const text = elem.textRun.content;
                        const textToSearch = caseSensitive ? text : text.toLowerCase();

                        let startPos = 0;
                        while (true) {
                            const index = textToSearch.indexOf(searchPattern, startPos);
                            if (index === -1) break;

                            matches.push({
                                startIndex: elem.startIndex + index,
                                endIndex: elem.startIndex + index + searchText.length,
                                text: text.substring(index, index + searchText.length)
                            });

                            startPos = index + 1;
                        }
                    }
                }
            }

            if (element.table) {
                for (const row of element.table.tableRows || []) {
                    for (const cell of row.tableCells || []) {
                        processElements(cell.content || []);
                    }
                }
            }

            if (element.tableOfContents) {
                processElements(element.tableOfContents.content || []);
            }
        }
    };

    processElements(content);

    return matches.sort((a, b) => a.startIndex - b.startIndex);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.findTextIndices,
        'Finds all indices of a character or word in a Google Docs document, similar to Google Docs Find tool',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            searchText: z.string().describe('Text to search for'),
            caseSensitive: z.boolean().optional().default(false).describe('Whether search should be case sensitive'),
        },
        async ({documentId, searchText, caseSensitive = false}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const matches = await findTextIndices(documentId, searchText, caseSensitive, oauth2Client);

                if (matches.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Search completed ✅\n\nFound 0 matches for "${searchText}"`,
                            },
                        ],
                    };
                }

                const matchList = matches
                    .map((match, i) => `${i + 1}. Index ${match.startIndex}-${match.endIndex}: "${match.text}"`)
                    .join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Search completed ✅\n\nFound ${matches.length} match${matches.length !== 1 ? 'es' : ''} for "${searchText}":\n\n${matchList}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to find text indices: ${error}`), tools.findTextIndices);
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
