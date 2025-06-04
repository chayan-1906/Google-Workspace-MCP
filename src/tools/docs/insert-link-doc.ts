import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const insertLinkDoc = async (documentId: string, startIndex: number, endIndex: number, url: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    updateTextStyle: {
                        range: {
                            startIndex,
                            endIndex,
                        },
                        textStyle: {
                            link: {
                                url,
                            },
                        },
                        fields: 'link',
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertLinkDoc,
        'Inserts a hyperlink into a Google Docs document at a specified position',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            startIndex: z.number().describe('The character index in the document where the hyperlink should begin (inclusive)'),
            endIndex: z.number().describe('The character index in the document where the hyperlink should end (exclusive).'),
            url: z.string().url().describe('The URL to link to'),
        },
        async ({documentId, startIndex, endIndex, url}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const text = await insertLinkDoc(documentId, startIndex, endIndex, url, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Hyperlink inserted ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert link: ${error}`), 'insert-link-doc');
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
