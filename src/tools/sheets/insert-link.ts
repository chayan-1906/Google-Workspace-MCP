import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from 'zod';
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const insertLink = async (spreadsheetId: string, sheetId: number, rowIndex: number, columnIndex: number, url: string, displayText: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    const requests = [
        {
            updateCells: {
                rows: [
                    {
                        values: [
                            {
                                userEnteredValue: {stringValue: displayText},
                                textFormatRuns: [
                                    {
                                        startIndex: 0,
                                        format: {
                                            link: {uri: url},
                                            underline: true,
                                            foregroundColor: {red: 255 / 255, green: 129 / 255, blue: 2 / 255},
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
                fields: 'userEnteredValue,textFormatRuns',
                start: {
                    sheetId,
                    rowIndex,
                    columnIndex,
                },
            },
        },
    ];

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {requests},
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertLink,
        'Inserts a hyperlink into a specific cell in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            rowIndex: z.number().describe('Row index (0-based)'),
            columnIndex: z.number().describe('Column index (0-based)'),
            url: z.string().url().describe('URL to link to'),
            displayText: z.string().describe('Text to display in cell'),
        },
        async ({spreadsheetId, sheetId, rowIndex, columnIndex, url, displayText}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await insertLink(spreadsheetId, sheetId, rowIndex, columnIndex, url, displayText, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Link inserted successfully ✅',
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert link: ${error}`), 'insert-link');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert link ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
