import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const appendDocText = async (documentId: string, text: string, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const doc = await docs.documents.get({documentId});
    const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex;

    if (!endIndex) {
        throw new Error('Unable to determine document end index');
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    insertText: {
                        location: {
                            index: endIndex - 1,
                        },
                        text: text + '\n',
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.appendDocText,
        'Appends text to the end of a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            text: z.string().describe('The text content to append at the end'),
        },
        async ({documentId, text}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await appendDocText(documentId, text, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* text appended successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to append text: ${error}`), tools.appendDocText);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to append text ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
