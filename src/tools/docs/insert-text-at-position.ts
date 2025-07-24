import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const insertTextAtPosition = async (documentId: string, insertIndex: number, textToInsert: string, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    insertText: {
                        location: {index: insertIndex},
                        text: ` ${textToInsert}`,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertTextAtPosition,
        'Inserts text at a specific character position in a Google Docs document',
        {
            documentId: z.string().describe('The ID for the Google Docs document to modify'),
            insertIndex: z.number().describe('The zero-based character index position where text will be inserted'),
            textToInsert: z.string().describe('The text content to insert at the specified position'),
        },
        async ({documentId, insertIndex, textToInsert}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await insertTextAtPosition(documentId, insertIndex, textToInsert, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* text inserted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert text: ${error}`), tools.insertTextAtPosition);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert text ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
