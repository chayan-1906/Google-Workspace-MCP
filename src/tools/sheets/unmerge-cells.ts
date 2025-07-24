import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const unmergeCells = async (spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    unmergeCells: {
                        range: {
                            sheetId,
                            startRowIndex,
                            endRowIndex,
                            startColumnIndex,
                            endColumnIndex,
                        },
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.unmergeCells,
        'Unmerges cells in the given range on a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            endRowIndex: z.number().describe('End row index (exclusive)'),
            startColumnIndex: z.number().describe('Start column index (inclusive)'),
            endColumnIndex: z.number().describe('End column index (exclusive)'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await unmergeCells(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* cells unmerged successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to unmerge cells: ${error}`), tools.unmergeCells);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to unmerge cells ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
