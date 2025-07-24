import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const appendSheetTabRow = async (spreadsheetId: string, range: string, values: any[][], auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    function formatIfDate(value: any): any {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = new Date(value);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        }
        return value;
    }

    const formattedValues = values.map(row => row.map(formatIfDate));

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: formattedValues,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.appendSheetTabRow,
        'Appends a new row in an existing spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            range: z.string().describe('The range in the spreadsheet where the data will be inserted'),
            values: z.array(z.array(z.any())).describe('A list where each inner list represents a row of the spreadsheet, and each string within a row corresponds to a cell value'),
        },
        async ({spreadsheetId, range, values}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await appendSheetTabRow(spreadsheetId, range, values, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* row appended successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to append row: ${error}`), tools.appendSheetTabRow);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to append row ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
