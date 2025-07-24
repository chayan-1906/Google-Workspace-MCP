import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const unfreezeRowsColumns = async (spreadsheetId: string, sheetId: number, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId,
                            gridProperties: {
                                frozenRowCount: 0,
                                frozenColumnCount: 0,
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
        tools.unfreezeRowsColumns,
        'Removes any frozen rows or columns from the Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
        },
        async ({spreadsheetId, sheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await unfreezeRowsColumns(spreadsheetId, sheetId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* unfrozen successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to unfreeze rows/columns: ${error}`), tools.unfreezeRowsColumns);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to unfreeze rows/columns ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
