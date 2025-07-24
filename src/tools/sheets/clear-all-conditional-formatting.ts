import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const clearAllConditionalFormatting = async (spreadsheetId: string, sheetId: number, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    while (true) {
        try {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteConditionalFormatRule: {
                                index: 0,
                                sheetId,
                            },
                        },
                    ],
                },
            });
        } catch (error: any) {
            break;
        }
    }
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.clearAllConditionalFormatting,
        'Clears all conditional formatting rules in a sheet tab in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
        },
        async ({spreadsheetId, sheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await clearAllConditionalFormatting(spreadsheetId, sheetId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* conditional formatting cleared successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to clear conditional formatting: ${error}`), tools.clearAllConditionalFormatting);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to clear conditional formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
