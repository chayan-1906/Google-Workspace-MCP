import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const getSheetTabContent = async (spreadsheetId: string, auth: Auth.OAuth2Client, ranges?: string[]) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

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
                const tabs = sheets?.map((sheet, i) => {
                    const title = sheet.properties?.title || 'Untitled';
                    const id = sheet.properties?.sheetId || 'unknown';
                    return `${i + 1}. 📄 ${title} → \`${id}\``;
                }) || [];

                if (sheets.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No sheets found 😕',
                            },
                        ],
                    };
                }

                const contentBlocks = sheets?.map((sheet, sheetIndex) => {
                    const title = sheet.properties?.title || `Sheet${sheetIndex + 1}`;
                    const rowData = sheet.data?.flatMap(d => d.rowData || []) || [];

                    const lines = rowData.map((row, i) => {
                        const cells = (row.values || []).map(cell => cell.formattedValue || '').join(' | ');
                        return `${i + 1}. ${cells}`;
                    });

                    return {
                        type: 'text' as const,
                        text: lines.length
                            ? `📊 Contents from sheet ${title}:\n\n${lines.join('\n')}`
                            : `No content found in ${title}.`,
                    };
                }) || [];

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Spreadsheet Tabs:\n${tabs.join('\n')}`,
                        },
                        ...contentBlocks,
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
