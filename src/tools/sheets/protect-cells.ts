import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const protectCells = async (spreadsheetId: string, sheetId: number, ranges: {
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number
}[], editorsEmails: string[], auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    const requests = ranges.map((range) => ({
        addProtectedRange: {
            protectedRange: {
                range: {
                    sheetId,
                    ...range,
                },
                editors: {
                    users: editorsEmails,
                },
                warningOnly: false, // Enforces restriction
            },
        },
    }));

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.protectCells,
        'Adds a protected range to specific cells with a warning in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            ranges: z.array(
                z.object({
                    startRowIndex: z.number(),
                    endRowIndex: z.number(),
                    startColumnIndex: z.number(),
                    endColumnIndex: z.number(),
                })
            ).describe('Array of ranges to protect'),
            editorsEmails: z.array(z.string().email()).describe('Emails of users allowed to edit'),
        },
        async ({spreadsheetId, sheetId, ranges, editorsEmails}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await protectCells(spreadsheetId, sheetId, ranges, editorsEmails, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* cells protected successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to protect ranges: ${error}`), tools.protectCells);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to protect ranges ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
