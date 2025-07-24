import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const functions = async (spreadsheetId: string, sheetId: number, rowIndex: number, columnIndex: number, formula: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const request = {
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateCells: {
                        rows: [
                            {
                                values: [
                                    {
                                        userEnteredValue: {
                                            formulaValue: formula,
                                        },
                                    },
                                ],
                            },
                        ],
                        fields: 'userEnteredValue',
                        start: {
                            sheetId,
                            rowIndex,
                            columnIndex,
                        },
                    },
                },
            ],
        },
    };

    await sheets.spreadsheets.batchUpdate(request);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.functions,
        'Applies spreadsheet function formulas (e.g., SUM, AVERAGE) to specific cell in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            rowIndex: z.number().describe('Row index where the result should go'),
            columnIndex: z.number().describe('Column index where the result should go'),
            formula: z.string().describe('Formula to apply (e.g., "=SUM(A2:A10)")'),
        },
        async ({spreadsheetId, sheetId, rowIndex, columnIndex, formula}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await functions(spreadsheetId, sheetId, rowIndex, columnIndex, formula, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* formula applied successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to apply formula: ${error}`), tools.functions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to apply formula ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
