import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from 'zod';
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const deleteRow = async (spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
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
        tools.deleteRow,
        'Deletes one or more rows in a sheet tab',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe("The numeric ID of the sheet tab"),
            startIndex: z.number().describe("Zero-based start index of row(s) to delete"),
            endIndex: z.number().describe("Zero-based end index (exclusive) of row(s) to delete"),
        },
        async ({spreadsheetId, sheetId, startIndex, endIndex}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteRow(spreadsheetId, sheetId, startIndex, endIndex, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Deleted rows ${startIndex} to ${endIndex - 1} from sheet ${sheetId} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete row: ${error}`), 'delete-row');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete row ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
