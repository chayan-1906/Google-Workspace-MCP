import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const deleteSpreadsheet = async (spreadsheetId: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    await drive.files.delete({
        fileId: spreadsheetId,
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteSpreadsheet,
        'Deletes a Google Spreadsheet from Drive permanently',
        {
            spreadsheetId: z.string().describe('The ID of the spreadsheet to delete'),
        },
        async ({spreadsheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteSpreadsheet(spreadsheetId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Spreadsheet deleted successfully! ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete spreadsheet: ${error}`), 'delete-spreadsheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
