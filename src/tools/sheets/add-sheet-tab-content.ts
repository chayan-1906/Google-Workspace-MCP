import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const addSheetTabContent = async (spreadsheetId: string, range: string, values: string[][], auth: Auth.OAuth2Client) => {
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
        tools.addSheetTabContent,
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
                await addSheetTabContent(spreadsheetId, range, values, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* content added successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add sheet content: ${error}`), tools.addSheetTabContent);
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
