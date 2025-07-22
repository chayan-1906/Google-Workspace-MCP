import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const freezeRowsColumns = async (spreadsheetId: string, sheetId: number, frozenRowCount: number, frozenColumnCount: number, auth: Auth.OAuth2Client) => {
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
                            gridProperties: {
                                frozenRowCount,
                                frozenColumnCount,
                            },
                        },
                        fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount',
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.freezeRowsColumns,
        'Freezes specified number of rows and columns in a sheet in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            frozenRowCount: z.number().min(0).default(1).describe('Number of rows to freeze from the top'),
            frozenColumnCount: z.number().min(0).default(0).describe('Number of columns to freeze from the left'),
        },
        async ({spreadsheetId, sheetId, frozenRowCount, frozenColumnCount}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await freezeRowsColumns(spreadsheetId, sheetId, frozenRowCount, frozenColumnCount, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Freeze settings applied successfully ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to freeze: ${error}`), tools.freezeRowsColumns);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to freeze ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
