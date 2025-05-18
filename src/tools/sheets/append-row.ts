import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from 'zod';
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {Auth, google} from "googleapis";

const appendRow = async (spreadsheetId: string, range: string, values: any[][], auth: Auth.OAuth2Client) => {
    const sheets = google.sheets({version: 'v4', auth});

    function formatIfDate(value: any): any {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const date = new Date(value);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        }
        return value;
    }

    const formattedValues = values.map(row => row.map(formatIfDate));

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: formattedValues,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.appendRow,
        'Appends a new row in an existing spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            range: z.string().describe('The range in the spreadsheet where the data will be inserted'),
            values: z.array(z.array(z.any())).describe('A list where each inner list represents a row of the spreadsheet, and each string within a row corresponds to a cell value'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({spreadsheetId, range, values, email}) => {
            const oauthClient = await getOAuthClientForUser(email);
            if (!oauthClient) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'User not authenticated. Please authenticate first. 🔑',
                        },
                    ],
                };
            }

            await appendRow(spreadsheetId, range, values, oauthClient);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Row added to ${range} ✅`,
                    },
                ],
            };
        },
    );
}
