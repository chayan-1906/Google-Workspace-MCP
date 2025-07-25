import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const addConditionalFormatting = async (spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number, conditionValue: string, conditionType: string, backgroundColor: object, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    if (startRowIndex >= endRowIndex || startColumnIndex >= endColumnIndex) {
        throw new Error('Invalid range: start indices must be less than end indices');
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [
                                {
                                    sheetId,
                                    startRowIndex,
                                    endRowIndex,
                                    startColumnIndex,
                                    endColumnIndex,
                                },
                            ],
                            booleanRule: {
                                condition: {
                                    type: conditionType,
                                    values: [
                                        {
                                            userEnteredValue: conditionValue,
                                        },
                                    ],
                                },
                                format: {
                                    backgroundColor,
                                },
                            },
                        },
                        index: 0,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.addConditionalFormatting,
        'Adds conditional formatting to a range in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            endRowIndex: z.number().describe('End row index (exclusive)'),
            startColumnIndex: z.number().describe('Start column index (inclusive)'),
            endColumnIndex: z.number().describe('End column index (exclusive)'),
            conditionValue: z.string().describe('Value to compare (e.g., 100)'),
            conditionType: z.enum(['NUMBER_GREATER', 'NUMBER_GREATER_THAN_EQ', 'NUMBER_LESS', 'NUMBER_LESS_THAN_EQ', 'NUMBER_EQ', 'NUMBER_NOT_EQ', 'TEXT_CONTAINS', 'TEXT_NOT_CONTAINS', 'TEXT_STARTS_WITH', 'TEXT_ENDS_WITH', 'TEXT_EQ', 'TEXT_NOT_EQ', 'DATE_EQ', 'DATE_BEFORE', 'DATE_AFTER', 'DATE_ON_OR_BEFORE', 'DATE_ON_OR_AFTER', 'BLANK', 'NOT_BLANK', 'CUSTOM_FORMULA']).describe('The type of condition to apply'),
            backgroundColor: z.object({
                red: z.number(),
                green: z.number(),
                blue: z.number(),
            }).describe('RGB background color for matched cells'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, conditionValue, conditionType, backgroundColor}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await addConditionalFormatting(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, conditionValue, conditionType, backgroundColor, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* conditional formatting added successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add conditional formatting: ${error}`), tools.addConditionalFormatting);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add conditional formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
