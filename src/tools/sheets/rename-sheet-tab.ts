import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const renameSheetTab = async (spreadsheetId: string, sheetId: number, sheetName: string, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId,
                            title: sheetName,
                        },
                        fields: 'title',
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.renameSheetTab,
        'Renames a sheet tab in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            sheetName: z.string().describe('New title for the sheet/tab'),
        },
        async ({spreadsheetId, sheetId, sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await renameSheetTab(spreadsheetId, sheetId, sheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet tab *${sheetName}* renamed successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to rename sheet: ${error}`), tools.renameSheetTab);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to rename sheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
