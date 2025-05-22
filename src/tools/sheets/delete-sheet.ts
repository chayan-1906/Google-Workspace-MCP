import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const deleteSheet = async (spreadsheetId: string, sheetId: number, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteSheet: {
                        sheetId,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteSheet,
        'Deletes a sheet tab by its numeric sheet ID',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Deletes a sheet tab by its numeric sheet ID'),
        },
        async ({spreadsheetId, sheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteSheet(spreadsheetId, sheetId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Deleted sheet with ID ${sheetId} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete sheet: ${error}`), 'delete-sheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete sheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
