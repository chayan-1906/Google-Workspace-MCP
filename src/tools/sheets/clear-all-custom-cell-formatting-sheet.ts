import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const clearAllCustomCellFormattingSheet = async (spreadsheetId: string, sheetId: number, auth: Auth.OAuth2Client,) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

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
        'Clears all custom cell formatting (like font, color, alignment) from the given Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
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
                            text: `Sheet *${spreadsheetId}* cell formatting cleared successfully! ✅`,
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
