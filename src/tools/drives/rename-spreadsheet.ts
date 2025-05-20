import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const renameSpreadsheet = async (spreadsheetId: string, sheetName: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const renamedSpreadsheet = await drive.files.update({
        fileId: spreadsheetId,
        requestBody: {
            name: sheetName,
        },
        fields: 'id, name',
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.renameSpreadsheet,
        'Renames an existing Google Spreadsheet by the spreadsheet ID',
        {
            spreadsheetId: z.string().describe('The ID of the spreadsheet file to rename'),
            sheetName: z.string().describe('The title of the new spreadsheet'),
        },
        async ({spreadsheetId, sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await renameSpreadsheet(spreadsheetId, sheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📄 Spreadsheet ${sheetName} renamed successfully! 🎉`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to rename spreadsheet: ${error}`), 'rename-spreadsheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to rename spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
