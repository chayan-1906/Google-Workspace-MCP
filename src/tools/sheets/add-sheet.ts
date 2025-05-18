import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";

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
        'Creates a new sheet tab in google spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetName: z.string().describe('The name of the sheet to be created'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({spreadsheetId, sheetName, email}) => {
            const oauth2Client = await getOAuthClientForUser(email);
            if (!oauth2Client) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'User not authenticated. Please authenticate first. 🔑',
                        },
                    ],
                };
            }

            // Force refresh token if expired before API call
            // await oauth2Client.getAccessToken();
            await addSheet(spreadsheetId, sheetName, oauth2Client);

            return {
                content: [
                    {
                        type: 'text',
                        text: `${sheetName} created ✅`,
                    },
                ],
            };
        },
    );
}
