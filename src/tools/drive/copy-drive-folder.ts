import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const copyDriveFolder = async (folderId: string, newName: string, auth: Auth.OAuth2Client, parentFolderId?: string) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const fileMetadata: any = {
        name: newName,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    const newFolder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
    });

    const contents = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType)',
    });

    const files = contents.data.files || [];
    for (const file of files) {
        if (file.mimeType !== 'application/vnd.google-apps.folder') {
            await drive.files.copy({
                fileId: file.id!,
                requestBody: {
                    name: file.name,
                    parents: [newFolder.data.id!],
                },
            });
        }
    }

    return {
        folderId: newFolder.data.id!,
        name: newFolder.data.name!,
        url: newFolder.data.webViewLink!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.copyDriveFolder,
        'Copies a folder in Google Drive to a new location with a new name',
        {
            folderId: z.string().describe('The ID of the folder to copy'),
            newName: z.string().describe('The name for the copied folder'),
            parentFolderId: z.string().optional().describe('Optional parent folder ID where the copied folder will be placed'),
        },
        async ({folderId, newName, parentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {folderId: copiedFolderId, name, url} = await copyDriveFolder(folderId, newName, oauth2Client, parentFolderId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Folder *${name}* copied successfully! ✅\n\n🔗 [Open Folder](${url})\n🆔 \`${copiedFolderId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to copy folder: ${error}`), tools.copyDriveFolder);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to copy folder ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
