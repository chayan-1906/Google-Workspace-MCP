import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

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
        'Clears all conditional formatting rules in a sheet',
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
                            text: 'All conditional formatting rules cleared from sheet ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to clear conditional formatting: ${error}`), 'clear-all-conditional-formatting');
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
