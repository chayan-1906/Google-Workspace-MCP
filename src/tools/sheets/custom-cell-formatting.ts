import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from "googleapis-common";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const customCellFormatting = async (spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number, numberFormatType: string = 'TEXT', auth: Auth.OAuth2Client, backgroundColor?: object, textFormat?: object) => {
    if (startRowIndex >= endRowIndex || startColumnIndex >= endColumnIndex) {
        throw new Error('Invalid range: start indices must be less than end indices');
    }

    const validNumberFormats = ['NUMBER', 'TEXT', 'DATE', 'TIME', 'PERCENT', 'CURRENCY', 'SCIENTIFIC', 'ACCOUNTING'];
    if (!validNumberFormats.includes(numberFormatType)) {
        throw new Error(`Invalid numberFormatType: ${numberFormatType}`);
    }

    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const request = {
        spreadsheetId,
        resource: {
            requests: [
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startRowIndex,
                            endRowIndex,
                            startColumnIndex,
                            endColumnIndex,
                        },
                        cell: {
                            userEnteredFormat: {
                                ...(backgroundColor && {backgroundColor}),
                                ...(textFormat && {textFormat}),
                                numberFormat: {type: numberFormatType},
                            },
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,numberFormat)',
                    },
                },
            ],
        },
    }

    await sheets.spreadsheets.batchUpdate(request);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.customCellFormatting,
        'Applies custom formatting to a specified cell range in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            endRowIndex: z.number().describe('End row index (exclusive)'),
            startColumnIndex: z.number().describe('Start column index (inclusive)'),
            endColumnIndex: z.number().describe('End column index (exclusive)'),
            numberFormatType: z.string().default('TEXT').describe('Number format type'),
            backgroundColor: z.object({
                red: z.number(),
                green: z.number(),
                blue: z.number(),
            }).optional().describe('RGB background color for matched cells'),
            textFormat: z.object({
                foregroundColor: z.object({
                    red: z.number(),
                    green: z.number(),
                    blue: z.number(),
                }).optional(),
                fontFamily: z.string().optional(),
                fontSize: z.number().optional(),
                bold: z.boolean().optional(),
                italic: z.boolean().optional(),
                strikethrough: z.boolean().optional(),
                underline: z.boolean().optional(),
            }).optional().describe('Text formatting options'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, numberFormatType, backgroundColor, textFormat}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await customCellFormatting(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, numberFormatType, oauth2Client, backgroundColor, textFormat);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Custom Formatting applied successfully ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add custom cell formatting: ${error}`), 'custom-cell-formatting');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add custom cell formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
