import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const findTextInDoc = async (documentId: string, searchText: string, auth: Auth.OAuth2Client): Promise<{ startIndex: number, endIndex: number }[]> => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);
    const res = await docs.documents.get({documentId});

    const matches: { startIndex: number, endIndex: number }[] = [];
    const content = res.data.body?.content || [];

    const processContent = (elements: any[], baseIndex: number = 0) => {
        let currentIndex = baseIndex;

        for (const element of elements) {
            if (element.paragraph) {
                for (const elem of element.paragraph.elements || []) {
                    if (elem.textRun?.content) {
                        const text = elem.textRun.content;
                        const searchLower = searchText.toLowerCase();
                        const textLower = text.toLowerCase();

                        let searchIndex = 0;
                        while (searchIndex < text.length) {
                            const index = textLower.indexOf(searchLower, searchIndex);
                            if (index === -1) break;

                            matches.push({
                                startIndex: Math.max(1, currentIndex + index),
                                endIndex: currentIndex + index + searchText.length
                            });

                            searchIndex = index + 1;
                        }
                        currentIndex += text.length;
                    }
                }
            }
            if (element.table) {
                for (const row of element.table.tableRows || []) {
                    for (const cell of row.tableCells || []) {
                        processContent(cell.content || [], currentIndex);
                    }
                }
            }
        }
    };

    processContent(content, 1);
    return matches;
}

const insertLinkInDoc = async (documentId: string, url: string, startIndex: number, endIndex: number, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    updateTextStyle: {
                        range: {
                            startIndex,
                            endIndex
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
        'Adds a hyperlink to existing text in a Google Docs document. Links ALL occurrences of searchText or specific range.',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            url: z.string().describe('The URL to link to'),
            startIndex: z.number().optional().describe('The start index of the text to link (0-based, inclusive)'),
            endIndex: z.number().optional().describe('The end index of the text to link (0-based, exclusive)'),
            searchText: z.string().optional().describe('Text to search for - links ALL occurrences found'),
        },
        async ({documentId, url, startIndex, endIndex, searchText}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                if (searchText) {
                    const matches = await findTextInDoc(documentId, searchText, oauth2Client);

                    if (matches.length === 0) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Text "${searchText}" not found ❌`,
                                },
                            ],
                        };
                    }

                    for (const match of matches.reverse()) {
                        await insertLinkInDoc(documentId, url, match.startIndex, match.endIndex, oauth2Client);
                    }

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `${matches.length} occurrence(s) of "${searchText}" linked ✅`,
                            },
                        ],
                    };
                }

                if (startIndex !== undefined && endIndex !== undefined) {
                    await insertLinkInDoc(documentId, url, startIndex, endIndex, oauth2Client);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Range [${startIndex}:${endIndex}] linked ✅`,
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Provide startIndex/endIndex or searchText ❌`,
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
