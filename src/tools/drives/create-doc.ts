import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const createDoc = async (docName: string, auth: Auth.OAuth2Client, parentFolderId?: string) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const fileMetadata: any = {
        name: docName,
        mimeType: 'application/vnd.google-apps.document',
    }

    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    const createdDoc = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
    });

    return {
        docId: createdDoc.data.id!,
        url: createdDoc.data.webViewLink!,
    }
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.createDoc,
        'Creates a new Google Doc in the specified Drive folder',
        {
            docName: z.string().describe('The title of the new Google Doc'),
            parentFolderId: z.string().optional().describe('Optional parent folder ID to place the doc inside'),
        },
        async ({docName, parentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {docId, url} = await createDoc(docName, oauth2Client, parentFolderId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📄 Doc *${docName}* created successfully! 🎉\n\n🔗 [Open Doc](${url})\n🆔 \`${docId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create doc: ${error}`), 'create-doc');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to create doc ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
