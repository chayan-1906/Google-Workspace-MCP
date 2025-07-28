import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const copyDriveFile = async (fileId: string, newName: string, auth: Auth.OAuth2Client, parentFolderId?: string) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const fileMetadata: any = {
        name: newName,
    };

    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    const copiedFile = await drive.files.copy({
        fileId: fileId,
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink, mimeType',
    });

    return {
        fileId: copiedFile.data.id!,
        name: copiedFile.data.name!,
        url: copiedFile.data.webViewLink!,
        mimeType: copiedFile.data.mimeType!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.copyDriveFile,
        'Copies a file in Google Drive to a new location with a new name',
        {
            fileId: z.string().describe('The ID of the file to copy'),
            newName: z.string().describe('The name for the copied file'),
            parentFolderId: z.string().optional().describe('Optional parent folder ID where the copied file will be placed'),
        },
        async ({fileId, newName, parentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {fileId: copiedFileId, name, url, mimeType} = await copyDriveFile(fileId, newName, oauth2Client, parentFolderId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File *${name}* copied successfully! ✅\n\n🔗 [Open File](${url})\n🆔 \`${copiedFileId}\`\n📄 Type: ${mimeType}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to copy file: ${error}`), tools.copyDriveFile);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to copy file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
