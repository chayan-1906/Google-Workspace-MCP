import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const clearRanges = async (spreadsheetId: string, ranges: string[], auth: Auth.OAuth2Client) => {
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.values.batchClear({
        spreadsheetId,
        requestBody: {
            ranges,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.clearRanges,
        'Clears certain ranges from a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            ranges: z.array(z.string()).describe('List of ranges to clear, e.g., Sheet1!A1:B2'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({spreadsheetId, ranges, email}) => {
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
                await clearRanges(spreadsheetId, ranges, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Cleared ${ranges.length} range(s) successfully from the spreadsheet ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to clear ranges: ${error}`), 'clear-ranges');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to clear ranges ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
