import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

interface RangeUpdate {
    range: string;
    values: any[][];
}

const updateRanges = async (spreadsheetId: string, updates: RangeUpdate[], auth: Auth.OAuth2Client) => {
    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: "USER_ENTERED",
            data: updates.map(({range, values}) => ({
                range,
                values,
            })),
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.updateRanges,
        'Updates specific ranges in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            updates: z.array(
                z.object({
                    range: z.string().describe('Target range like Sheet1!A1:B2'),
                    values: z.array(z.array(z.any())).describe('2D array of values to update'),
                })
            ).describe("Array of updates"),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({spreadsheetId, updates, email}) => {
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
                await updateRanges(spreadsheetId, updates, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Updated ${updates.length} range(s) successfully in the spreadsheet ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to update ranges: ${error}`), 'update-ranges');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to update ranges ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
