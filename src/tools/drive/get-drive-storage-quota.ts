import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const getDriveStorageQuota = async (auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const about = await drive.about.get({
        fields: 'storageQuota',
    });

    const quota = about.data.storageQuota!;
    const used = parseInt(quota.usage || '0');
    const limit = parseInt(quota.limit || '0');
    const usedInTrash = parseInt(quota.usageInDriveTrash || '0');

    return {
        used,
        limit,
        usedInTrash,
        available: limit - used,
        usagePercentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDriveStorageQuota,
        'Gets Google Drive storage quota and usage information',
        {},
        async () => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {used, limit, usedInTrash, available, usagePercentage} = await getDriveStorageQuota(oauth2Client);

                const formatBytes = (bytes: number) => {
                    if (bytes === 0) return '0 B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📊 **Drive Storage Usage** ✅\n\n📈 Used: ${formatBytes(used)} (${usagePercentage}%)\n💾 Total: ${formatBytes(limit)}\n🆓 Available: ${formatBytes(available)}\n🗑️ In Trash: ${formatBytes(usedInTrash)}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get storage quota: ${error}`), tools.getDriveStorageQuota);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get storage quota ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
