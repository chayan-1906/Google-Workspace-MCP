import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const duplicateSheetTab = async (spreadsheetId: string, sourceSheetId: number, newSheetName: string, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    duplicateSheet: {
                        sourceSheetId,
                        newSheetName,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.duplicateSheetTab,
        'Duplicates a sheet and assigns a new name in given Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sourceSheetId: z.number().describe('ID of the sheet to duplicate'),
            newSheetName: z.string().describe('Name for the new duplicated sheet'),
        },
        async ({spreadsheetId, sourceSheetId, newSheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await duplicateSheetTab(spreadsheetId, sourceSheetId, newSheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet tab *${newSheetName}* duplicated successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to duplicate sheet: ${error}`), tools.duplicateSheetTab);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to duplicate sheet tab ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
