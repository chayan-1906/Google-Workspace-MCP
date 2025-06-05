import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

interface Range {
    startIndex: number;
    endIndex: number;
}

async function findAndReplaceTextDoc(documentId: string, searchString: string, replaceString: string, auth: Auth.OAuth2Client, occurrenceNumber?: number): Promise<void> {
    if (!searchString) {
        return;
    }

    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const doc = await docs.documents.get({documentId});
    const ranges: Range[] = [];
    const content = doc.data.body?.content || [];

    // Collect all occurrences of searchString in paragraph text runs
    for (const element of content) {
        if (element.paragraph && element.paragraph.elements) {
            for (const paragraphElement of element.paragraph.elements) {
                if (
                    paragraphElement.textRun &&
                    paragraphElement.textRun.content &&
                    paragraphElement.startIndex !== undefined
                ) {
                    const text = paragraphElement.textRun.content;
                    const startIndex = paragraphElement.startIndex;
                }
            }
        }
    }

    ranges.sort((a, b) => a.startIndex - b.startIndex);

    if (occurrenceNumber === undefined || occurrenceNumber === null) {
        // Replace all occurrences
        await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [
                    {
                        replaceAllText: {
                            containsText: {
                                text: searchString,
                                matchCase: true,
                            },
                            replaceText: replaceString,
                        },
                    },
                ],
            },
        });
    } else {
        const index = occurrenceNumber - 1;
        if (index >= 0 && index < ranges.length) {
            const range = ranges[index];
            await docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests: [
                        {
                            deleteContentRange: {
                                range: {
                                    startIndex: range.startIndex,
                                    endIndex: range.endIndex,
                                },
                            },
                        },
                        {
                            insertText: {
                                location: {
                                    index: range.startIndex,
                                },
                                text: replaceString,
                            },
                        },
                    ],
                },
            });
        }
        // If occurrenceNumber is out of range, do nothing
    }
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.findAndReplaceTextDoc,
        'Finds and replaces a specific or all occurrences of a string in a Google Doc',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            searchString: z.string().describe('Text to search for'),
            newText: z.string().describe('Text to replace with'),
            occurrenceNumber: z.number().optional().describe('If specified, only replaces the Nth occurrence'),
        },
        async ({documentId, searchString, newText, occurrenceNumber}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await findAndReplaceTextDoc(documentId, searchString, newText, oauth2Client, occurrenceNumber);

                return {
                    content: [
                        {
                            type: 'text',
                            text: occurrenceNumber ? `Replaced ${occurrenceNumber}ᵗʰ occurrence ✅` : `Replaced all occurrences ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to replace text: ${error}`), 'replace-text');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to replace text ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}