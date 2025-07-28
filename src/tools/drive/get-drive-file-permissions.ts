import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const getDriveFilePermissions = async (fileId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const permissions = await drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(id, type, role, emailAddress, displayName, domain)',
    });

    return permissions.data.permissions || [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDriveFilePermissions,
        'Gets all permissions for a Google Drive file',
        {
            fileId: z.string().describe('The ID of the file to get permissions for'),
        },
        async ({fileId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const permissions = await getDriveFilePermissions(fileId, oauth2Client);

                if (permissions.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No permissions found for file \`${fileId}\``,
                            },
                        ],
                    };
                }

                const permissionList = permissions.map((perm: { id?: string | null; type?: string | null; role?: string | null; emailAddress?: string | null; displayName?: string | null; domain?: string | null }) => {
                    const identifier = perm.emailAddress || perm.domain || perm.type;
                    const name = perm.displayName ? ` (${perm.displayName})` : '';
                    return `🔑 **${perm.role}** - ${identifier}${name}\n🆔 \`${perm.id}\`\n`;
                }).join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File permissions for \`${fileId}\` ✅\n\n${permissionList}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get file permissions: ${error}`), tools.getDriveFilePermissions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get file permissions ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
