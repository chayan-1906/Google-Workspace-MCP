import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const addSheetContent = async (spreadsheetId: string, range: string, values: string[][], auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values,
        },
    });

    return response.data;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.addSheetContent,
        'Adds new content (rows) to a specified range in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            range: z.string().describe('The A1-style range like Sheet1!A1'),
            values: z.array(z.array(z.string())).describe('2D array of row-wise string values'),
        },
        async ({spreadsheetId, range, values}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await addSheetContent(spreadsheetId, range, values, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Content added successfully to ${range} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add sheet content: ${error}`), 'add-sheet-content');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add sheet content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
