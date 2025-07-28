import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const getDriveSharedWithMe = async (auth: Auth.OAuth2Client, pageSize: number = 10) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const response = await drive.files.list({
        q: 'sharedWithMe=true and trashed=false',
        pageSize: pageSize,
        fields: 'files(id, name, mimeType, modifiedTime, owners, webViewLink)',
        orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDriveSharedWithMe,
        'Lists files shared with the authenticated user',
        {
            pageSize: z.number().optional().default(10).describe('Number of files to return (max 100)'),
        },
        async ({pageSize}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const files = await getDriveSharedWithMe(oauth2Client, pageSize);

                if (files.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No files shared with you 📭`,
                            },
                        ],
                    };
                }

                const fileList = files.map((file: { id?: string | null; name?: string | null; mimeType?: string | null; modifiedTime?: string | null; owners?: Array<{ displayName?: string | null }> | null; webViewLink?: string | null }) => {
                    const ownerName = file.owners?.[0]?.displayName || 'Unknown';
                    return `📄 **${file.name}**\n🆔 \`${file.id}\`\n👤 Owner: ${ownerName}\n📁 Type: ${file.mimeType}\n📅 Modified: ${file.modifiedTime}\n🔗 [Open](${file.webViewLink})\n`;
                }).join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📬 **Files Shared With Me** (${files.length}) ✅\n\n${fileList}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get shared files: ${error}`), tools.getDriveSharedWithMe);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get shared files ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
