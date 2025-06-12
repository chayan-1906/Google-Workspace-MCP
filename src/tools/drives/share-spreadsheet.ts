import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const shareSpreadsheet = async (spreadsheetId: string, emailAddresses: string[], role: 'reader' | 'writer', auth: Auth.OAuth2Client,) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const sharedWith: string[] = [];

    for (const email of emailAddresses) {
        try {
            await drive.permissions.create({
                fileId: spreadsheetId,
                requestBody: {
                    type: 'user',
                    role,
                    emailAddress: email,
                },
                fields: 'id',
            });
            sharedWith.push(email);
        } catch (err) {
            console.error(`Failed to share with ${email}:`, err);
        }
    }

    return {sharedWith};
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.shareSpreadsheet,
        'Shares the Google Spreadsheet with one or more users',
        {
            spreadsheetId: z.string().describe('The ID of the spreadsheet to share'),
            emailAddresses: z
                .array(z.string().email())
                .nonempty()
                .describe('List of email addresses to share the spreadsheet with'),
            role: z
                .enum(['reader', 'writer'])
                .describe('Permission level: reader (view only) or writer (edit access)'),
        },
        async ({spreadsheetId, emailAddresses, role}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {sharedWith} = await shareSpreadsheet(spreadsheetId, emailAddresses, role, oauth2Client);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Spreadsheet shared with: ${sharedWith.join(', ')} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to share spreadsheet: ${error}`), 'share-spreadsheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to share spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
