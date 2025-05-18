import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const getSheetContent = async (spreadsheetId: string, range: string, auth: Auth.OAuth2Client) => {
    const sheets = google.sheets({version: 'v4', auth});

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    return response.data.values || [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getSheetContent,
        'Fetches values from a specific sheet range',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            range: z.string().describe('Range like Sheet1!A1:B2'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({spreadsheetId, range, email}) => {
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

            try {
                const values = await getSheetContent(spreadsheetId, range, oauth2Client);

                if (values.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No content found in range ${range} 😕`,
                            },
                        ],
                    };
                }

                const formattedContent = values
                    .map((row, i) => `${i + 1}. ${row.join(' | ')}`)
                    .join("\n");

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Here are the contents of the range: 🎉\n\n${formattedContent}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch content: ${error}`), 'get-sheet-content');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
