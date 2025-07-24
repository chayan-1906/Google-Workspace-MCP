import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const getSheetTabContent = async (spreadsheetId: string, auth: Auth.OAuth2Client, ranges?: string[]) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
        ranges,
        fields: 'sheets(properties(title,sheetId),data.rowData.values.formattedValue)',
    });

    return response.data.sheets || [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getSheetTabContent,
        'Fetches values from a specific sheet range in given Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            ranges: z.array(z.string()).optional().describe('Optional list of A1-style ranges like ["Sheet1!A1:B2", "Sheet2!A5:C9"]'),
        },
        async ({spreadsheetId, ranges}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const sheets = await getSheetTabContent(spreadsheetId, oauth2Client, ranges);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* content retrieved successfully! ✅\n\n${sheets.length} sheet${sheets.length !== 1 ? 's' : ''} found`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch sheet tab content: ${error}`), tools.getSheetTabContent);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
