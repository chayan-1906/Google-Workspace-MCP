import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const createDriveFolder = async (name: string, auth: Auth.OAuth2Client, parentFolderId?: string) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const fileMetadata: any = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
    });

    return {
        folderId: folder.data.id!,
        name: folder.data.name!,
        url: folder.data.webViewLink!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.createDriveFolder,
        'Creates a new folder in Google Drive',
        {
            name: z.string().describe('The name of the folder to create'),
            parentFolderId: z.string().optional().describe('Optional parent folder ID to create the folder inside'),
        },
        async ({name, parentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {folderId, url} = await createDriveFolder(name, oauth2Client, parentFolderId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Folder *${name}* created successfully! ✅\n\n🔗 [Open Folder](${url})\n🆔 \`${folderId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create folder: ${error}`), tools.createDriveFolder);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to create folder ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
