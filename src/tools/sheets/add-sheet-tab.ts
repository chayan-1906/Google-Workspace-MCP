import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const addSheetTab = async (spreadsheetId: string, sheetName: string, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: sheetName,
                        },
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.addSheetTab,
        'Creates a new sheet tab in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetName: z.string().describe('The name of the sheet to be created'),
        },
        async ({spreadsheetId, sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await addSheetTab(spreadsheetId, sheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* tab added successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add sheet tab: ${error}`), tools.addSheetTab);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add sheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
