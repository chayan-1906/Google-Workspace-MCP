import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const updateDriveFilePermissions = async (fileId: string, email: string, role: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const permission = await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: role,
            type: 'user',
            emailAddress: email,
        },
        fields: 'id',
    });

    return {
        fileId,
        email,
        role,
        permissionId: permission.data.id!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.updateDriveFilePermissions,
        'Updates permissions for a specific user on a Google Drive file',
        {
            fileId: z.string().describe('The ID of the file to update permissions for'),
            email: z.string().describe('Email address of the user to grant permissions'),
            role: z.enum(['reader', 'writer', 'commenter', 'owner']).describe('Permission level to grant'),
        },
        async ({fileId, email, role}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {permissionId} = await updateDriveFilePermissions(fileId, email, role, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File permissions updated successfully! ✅\n🔑 ${email} now has *${role}* access\n🆔 Permission ID: \`${permissionId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to update file permissions: ${error}`), tools.updateDriveFilePermissions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to update file permissions ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
