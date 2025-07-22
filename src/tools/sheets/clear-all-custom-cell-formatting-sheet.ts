import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const clearAllCustomCellFormattingSheet = async (spreadsheetId: string, sheetId: number, auth: Auth.OAuth2Client,) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const requests = [
        {
            repeatCell: {
                range: {sheetId},
                cell: {
                    userEnteredFormat: {},
                },
                fields: 'userEnteredFormat',
            },
        },
    ];

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {requests},
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.clearAllCustomCellFormattingSheet,
        'Clears all custom cell formatting (like font, color, alignment) from the given Google SpreadSheet',
        {
            spreadsheetId: z.string().describe('The spreadsheet ID'),
            sheetId: z.number().describe('The sheet tab ID whose formatting should be cleared'),
        },
        async ({spreadsheetId, sheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await clearAllCustomCellFormattingSheet(spreadsheetId, sheetId, oauth2Client);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Cleared all custom cell formatting in the sheet ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to clear custom cell formatting: ${error}`), tools.clearAllCustomCellFormattingSheet);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to clear custom cell formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}

