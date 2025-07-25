import {z} from "zod";
import {Auth, sheets_v4} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
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

                if (sheets.length === 0) {
                    return {
                        content: [{
                            type: 'text',
                            text: 'No sheets found 😕',
                        }],
                    };
                }

                const tabs = sheets?.map((sheet: sheets_v4.Schema$Sheet, i: number) => {
                    const title = sheet.properties?.title || 'Untitled';
                    const id = sheet.properties?.sheetId || 0;
                    return `${i + 1}. 📄 ${title} → \`${id}\``;
                }) || [];

                const contentBlocks = sheets.map((sheet: sheets_v4.Schema$Sheet, sheetIndex: number) => {
                    const title = sheet.properties?.title || `Sheet${sheetIndex + 1}`;
                    const sheetId = sheet.properties?.sheetId;
                    const rowData = sheet.data?.flatMap((d: sheets_v4.Schema$GridData) => d.rowData || []) || [];

                    const lines = rowData.map((row: sheets_v4.Schema$RowData, i: number) => {
                        const cells = (row.values || []).map((cell: sheets_v4.Schema$CellData) => cell.formattedValue || '').join(' | ');
                        return `${i + 1}. ${cells}`;
                    });

                    return {
                        type: 'text' as const,
                        text: lines.length
                            ? `📊 Contents from sheet ${title}:\n\n${lines.join('\n')}`
                            : `No content found in ${title}.`,
                    };
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* content retrieved successfully! ✅\nTabs:\n${tabs.join('\n')}`,
                        },
                        ...contentBlocks,
                    ],
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendError(transport, new Error(`Failed to fetch sheet tab content: ${error}`), tools.getSheetTabContent);
                return {
                    content: [{
                        type: 'text',
                        text: `Failed to fetch content ❌: ${errorMessage}`,
                    }],
                };
            }
        },
    );
}
