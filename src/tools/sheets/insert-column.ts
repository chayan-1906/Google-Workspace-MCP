import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const insertColumn = async (spreadsheetId: string, sheetId: number, columnIndex: number, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    insertDimension: {
                        range: {
                            sheetId,
                            dimension: 'COLUMNS',
                            startIndex: columnIndex,
                            endIndex: columnIndex + 1,
                        },
                        inheritFromBefore: true,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertColumn,
        'Inserts a new column in a sheet at a specific position in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            columnIndex: z.number().describe('Zero-based column index to insert at'),
        },
        async ({spreadsheetId, sheetId, columnIndex}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await insertColumn(spreadsheetId, sheetId, columnIndex, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Inserted a column at index ${columnIndex} in sheet ${sheetId} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert column: ${error}`), tools.insertColumn);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert column ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
