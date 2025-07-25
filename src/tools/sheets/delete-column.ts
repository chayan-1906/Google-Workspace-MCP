import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const deleteColumn = async (spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'COLUMNS',
                            startIndex,
                            endIndex,
                        },
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteColumn,
        'Deletes one or more columns in a sheet tab from Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            startIndex: z.number().describe('Zero-based start index of column(s) to delete'),
            endIndex: z.number().describe('Zero-based end index (exclusive) of column(s) to delete'),
        },
        async ({spreadsheetId, sheetId, startIndex, endIndex}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteColumn(spreadsheetId, sheetId, startIndex, endIndex, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* columns deleted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete column: ${error}`), tools.deleteColumn);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete column ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
