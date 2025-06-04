import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const renameSheet = async (spreadsheetId: string, sheetId: number, sheetName: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId,
                            title: sheetName,
                        },
                        fields: 'title',
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.renameSheet,
        'Renames a sheet tab in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            sheetName: z.string().describe('New title for the sheet/tab'),
        },
        async ({spreadsheetId, sheetId, sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await renameSheet(spreadsheetId, sheetId, sheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet renamed to *${sheetName}* ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to rename sheet: ${error}`), 'rename-sheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to rename sheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
