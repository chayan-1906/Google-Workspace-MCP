import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const getDriveFileMetadata = async (fileId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const file = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, owners, parents, webViewLink, webContentLink, shared, trashed',
    });

    return {
        id: file.data.id!,
        name: file.data.name!,
        mimeType: file.data.mimeType!,
        size: file.data.size,
        createdTime: file.data.createdTime!,
        modifiedTime: file.data.modifiedTime!,
        owners: file.data.owners,
        parents: file.data.parents,
        webViewLink: file.data.webViewLink!,
        webContentLink: file.data.webContentLink,
        shared: file.data.shared,
        trashed: file.data.trashed,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDriveFileMetadata,
        'Gets detailed metadata for a Google Drive file',
        {
            fileId: z.string().describe('The ID of the file to get metadata for'),
        },
        async ({fileId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const metadata = await getDriveFileMetadata(fileId, oauth2Client);

                const ownerNames = metadata.owners?.map((owner: { displayName?: string }) => owner.displayName).join(', ') || 'Unknown';
                const sizeStr = metadata.size ? `${Math.round(parseInt(metadata.size) / 1024)} KB` : 'N/A';

                return {
                    content: [
                        {
                            type: 'text',
                            text: `**${metadata.name}** metadata ✅\n\n🆔 \`${metadata.id}\`\n📁 Type: ${metadata.mimeType}\n📏 Size: ${sizeStr}\n👤 Owner(s): ${ownerNames}\n📅 Created: ${metadata.createdTime}\n🔄 Modified: ${metadata.modifiedTime}\n🔗 [View](${metadata.webViewLink})${metadata.webContentLink ? `\n📥 [Download](${metadata.webContentLink})` : ''}\n${metadata.shared ? '🔓 Shared' : '🔒 Private'}${metadata.trashed ? ' | 🗑️ Trashed' : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get file metadata: ${error}`), tools.getDriveFileMetadata);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get file metadata ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
