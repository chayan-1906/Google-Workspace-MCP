import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const renameDoc = async (documentId: string, documentName: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    await drive.files.update({
        fileId: documentId,
        requestBody: {
            name: documentName,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.renameDoc,
        'Renames a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Docs document to rename'),
            documentName: z.string().describe('The new title of the document'),
        },
        async ({documentId, documentName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await renameDoc(documentId, documentName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* renamed to *${documentName}* successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to rename doc: ${error}`), tools.renameDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to rename doc ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
