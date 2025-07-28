import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const setDriveLinkPermission = async (fileId: string, role: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const permission = await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: role,
            type: 'anyone',
        },
        fields: 'id',
    });

    const file = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
    });

    return {
        fileId,
        role,
        viewLink: file.data.webViewLink!,
        downloadLink: file.data.webContentLink,
        permissionId: permission.data.id!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.setDriveLinkPermission,
        'Sets link sharing permissions for a Google Drive file (anyone with link can access)',
        {
            fileId: z.string().describe('The ID of the file to set link permissions'),
            role: z.enum(['reader', 'writer', 'commenter']).describe('Permission level for anyone with the link'),
        },
        async ({fileId, role}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {viewLink, downloadLink} = await setDriveLinkPermission(fileId, role, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Link permission set to *${role}* ✅\n🔗 [View Link](${viewLink})${downloadLink ? `\n📥 [Download Link](${downloadLink})` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to set link permission: ${error}`), tools.setDriveLinkPermission);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set link permission ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
