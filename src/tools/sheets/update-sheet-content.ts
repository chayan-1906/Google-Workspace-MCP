import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const updateSheetContent = async (spreadsheetId: string, range: string, values: string[][], auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.updateSheetContent,
        'Overwrites content in a specific Google Spreadsheet range',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            range: z.string().describe('Range like Sheet1!A1:B2'),
            values: z.array(z.array(z.string())).describe('2D array of values to write'),
        },
        async ({spreadsheetId, range, values}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await updateSheetContent(spreadsheetId, range, values, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully updated range ${range} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to update sheet content: ${error}`), 'update-sheet-content');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to update sheet content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
