import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const deleteDoc = async (documentId: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    await drive.files.delete({
        fileId: documentId,
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteDoc,
        'Deletes a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Doc to be deleted from Google Drive'),
        },
        async ({documentId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteDoc(documentId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* deleted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create doc: ${error}`), 'delete-doc');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete doc ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
