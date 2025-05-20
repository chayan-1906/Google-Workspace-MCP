import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const addSheet = async (spreadsheetId: string, sheetName: string, auth: Auth.OAuth2Client) => {
    const sheets = google.sheets({version: 'v4', auth});

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
        tools.addSheet,
        'Creates a new sheet tab in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetName: z.string().describe('The name of the sheet to be created'),
        },
        async ({spreadsheetId, sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await addSheet(spreadsheetId, sheetName, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `${sheetName} created ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add sheet: ${error}`), 'add-sheet');
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
