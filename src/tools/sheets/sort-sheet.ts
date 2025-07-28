import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const sortSheet = async (spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number, sortSpecs: {
    dimensionIndex: number;
    sortOrder: 'ASCENDING' | 'DESCENDING'
}[], auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    sortRange: {
                        range: {
                            sheetId,
                            startRowIndex,
                            endRowIndex,
                            startColumnIndex,
                            endColumnIndex,
                        },
                        sortSpecs,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.sortSheet,
        'Sorts a row range by one or more column indexes in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            endRowIndex: z.number().describe('End row index (exclusive)'),
            startColumnIndex: z.number().describe('Start column index (inclusive)'),
            endColumnIndex: z.number().describe('End column index (exclusive)'),
            sortSpecs: z
                .array(
                    z.object({
                        dimensionIndex: z
                            .number()
                            .describe('Zero-based index of the column to sortSheet by'),
                        sortOrder: z
                            .enum(['ASCENDING', 'DESCENDING'])
                            .describe('Sort direction'),
                    })
                )
                .describe('One or more column sortSheet specifications'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sortSpecs}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await sortSheet(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sortSpecs, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* sorted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to sort: ${error}`), tools.sortSheet);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to sort ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
