import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

// TODO: Fix
const extractTextFromContent = (content: any[]): string => {
    let text = '';
    for (const element of content) {
        if (element.paragraph) {
            for (const elem of element.paragraph.elements) {
                if (elem.textRun?.content) {
                    text += elem.textRun.content;
                }
            }
        }
    }
    return text;
}

const getDocContent = async (documentId: string, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);
    const res = await docs.documents.get({documentId});
    const content = res.data.body?.content || [];
    return extractTextFromContent(content);
}

const findWordBoundaries = (text: string, searchTerm: string): { startIndex: number, endIndex: number } | null => {
    let searchIndex = 0;

    while (searchIndex < text.length) {
        const index = text.toLowerCase().indexOf(searchTerm.toLowerCase(), searchIndex);
        if (index === -1) return null;

        // Check if this is a word boundary (not part of another word)
        const beforeChar = index > 0 ? text[index - 1] : ' ';
        const afterChar = index + searchTerm.length < text.length ? text[index + searchTerm.length] : ' ';

        if (!/[a-zA-Z0-9]/.test(beforeChar) && !/[a-zA-Z0-9]/.test(afterChar)) {
            return {
                startIndex: Math.max(1, index),
                endIndex: index + searchTerm.length
            };
        }

        searchIndex = index + 1;
    }

    return null;
}

const insertLinkInDoc = async (documentId: string, url: string, startIndex: number, endIndex: number, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    // Ensure we don't try to format the section break (index 0)
    const safeStartIndex = Math.max(1, startIndex);
    const safeEndIndex = Math.max(safeStartIndex + 1, endIndex);

    // Apply the link formatting to existing text
    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    updateTextStyle: {
                        range: {
                            startIndex: safeStartIndex,
                            endIndex: safeEndIndex
                        },
                        textStyle: {
                            link: {
                                url: url
                            }
                        },
                        fields: 'link'
                    }
                }
            ]
        }
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertLinkDoc,
        'Adds a hyperlink to existing text in a Google Docs document. Can either use specific indices or search for text to link.',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            url: z.string().describe('The URL to link to'),
            startIndex: z.number().optional().describe('The start index of the text to link (0-based, inclusive)'),
            endIndex: z.number().optional().describe('The end index of the text to link (0-based, exclusive)'),
            searchText: z.string().optional().describe('Text to search for and convert to link (alternative to using indices)'),
        },
        async ({documentId, url, startIndex, endIndex, searchText}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                let finalStartIndex = startIndex;
                let finalEndIndex = endIndex;

                // If searchText is provided, find the word boundaries
                if (searchText && (!startIndex || !endIndex)) {
                    const docText = await getDocContent(documentId, oauth2Client);
                    const boundaries = findWordBoundaries(docText, searchText);

                    if (!boundaries) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Text "${searchText}" not found in document ❌`,
                                },
                            ],
                        };
                    }

                    finalStartIndex = boundaries.startIndex;
                    finalEndIndex = boundaries.endIndex;
                }

                if (finalStartIndex === undefined || finalEndIndex === undefined) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Either provide startIndex/endIndex or searchText ❌`,
                            },
                        ],
                    };
                }

                await insertLinkInDoc(documentId, url, finalStartIndex, finalEndIndex, oauth2Client);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* hyperlink inserted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert link: ${error}`), tools.insertLinkDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert link ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
