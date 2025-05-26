import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const filter = async (spreadsheetId: string, sheetId: number, startRowIndex: number, criteria: Record<string, any>, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const request = {
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    setBasicFilter: {
                        filter: {
                            range: {
                                sheetId,
                                startRowIndex,
                            },
                            criteria,
                        },
                    },
                },
            ],
        },
    };

    await sheets.spreadsheets.batchUpdate(request);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.filter,
        'Applies filter view to a specified cell range in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            criteria: z.record(
                z.string(),
                z.object({
                    condition: z.object({
                        type: z.enum([
                            'TEXT_EQ',
                            'TEXT_NOT_EQ',
                            'NUMBER_EQ',
                            'NUMBER_GT',
                            'NUMBER_LT',
                            'BOOLEAN_EQ',
                            'DATE_BEFORE',
                            'DATE_AFTER',
                            'DATE_EQ',
                            'TEXT_CONTAINS',
                            'TEXT_NOT_CONTAINS',
                        ]),
                        values: z
                            .array(
                                z.object({
                                    userEnteredValue: z.string(),
                                })
                            )
                            .min(1),
                    }),
                })
            ).describe('Filter criteria per column index'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, criteria}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await filter(spreadsheetId, sheetId, startRowIndex, criteria, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Rows filtered successfully ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to filter: ${error}`), 'filter');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to filter ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
