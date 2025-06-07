import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const insertTextAtPosition = async (documentId: string, insertIndex: number, textToInsert: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const doc = await docs.documents.get({documentId});

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
        'Inserts text at a specific position in a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            insertIndex: z.number().describe('The index where the text to be inserted'),
            textToInsert: z.string().describe('The text to insert'),
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
                            text: `Text inserted at ${insertIndex} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert text: ${error}`), 'insert-text-at-position');
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
