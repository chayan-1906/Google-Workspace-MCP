import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const removeDriveFileAccess = async (fileId: string, emailOrPermissionId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    let permissionId = emailOrPermissionId;

    if (emailOrPermissionId.includes('@')) {
        const permissions = await drive.permissions.list({
            fileId: fileId,
            fields: 'permissions(id, emailAddress)',
        });

        const permission = permissions.data.permissions?.find((p: { id?: string | null; emailAddress?: string | null }) => p.emailAddress === emailOrPermissionId);
        if (!permission) {
            throw new Error(`No permission found for email: ${emailOrPermissionId}`);
        }
        permissionId = permission.id!;
    }

    await drive.permissions.delete({
        fileId: fileId,
        permissionId: permissionId,
    });

    return {
        fileId,
        removedAccess: emailOrPermissionId,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.removeDriveFileAccess,
        'Removes access permissions for a specific user from a Google Drive file',
        {
            fileId: z.string().describe('The ID of the file to remove access from'),
            emailOrPermissionId: z.string().describe('Email address of user or permission ID to remove access'),
        },
        async ({fileId, emailOrPermissionId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {removedAccess} = await removeDriveFileAccess(fileId, emailOrPermissionId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File access removed successfully! ✅\n🚫 Removed access for: ${removedAccess}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to remove file access: ${error}`), tools.removeDriveFileAccess);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to remove file access ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
