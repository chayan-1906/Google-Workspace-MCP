import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const unshareSpreadsheet = async (spreadsheetId: string, emailAddresses: string[] | 'ALL', auth: Auth.OAuth2Client,) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const permissions = await drive.permissions.list({
        fileId: spreadsheetId,
        fields: 'permissions(id,emailAddress,role)',
    });

    const removed: string[] = [];

    for (const permission of permissions.data.permissions || []) {
        const email = permission.emailAddress;

        // Skip owner
        if (!email || permission.role === 'owner') continue;

        const shouldRemove =
            emailAddresses === 'ALL' || (Array.isArray(emailAddresses) && emailAddresses.includes(email));

        if (shouldRemove) {
            await drive.permissions.delete({
                fileId: spreadsheetId,
                permissionId: permission.id!,
            });
            removed.push(email);
        }
    }

    return {removed};
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.unshareSpreadsheet,
        'Unshares the spreadsheet from specific email addresses (ignores if not shared)',
        {
            spreadsheetId: z.string().describe('The ID of the spreadsheet to share'),
            emailAddresses: z.union([
                z.literal('ALL'),
                z.array(z.string().email()).min(1),
            ]).describe('Email addresses to unshare the spreadsheet from, or "ALL" to remove all collaborators'),
        },
        async ({spreadsheetId, emailAddresses}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {removed} = await unshareSpreadsheet(spreadsheetId, emailAddresses, oauth2Client);
                return {
                    content: [
                        {
                            type: 'text',
                            text: removed.length > 0
                                ? `Unshared from: ${removed.join(', ')} ✅`
                                : `No matching emails found to unshare ℹ️`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to unshare spreadsheet: ${error}`), tools.unshareSpreadsheet);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to unshare spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
