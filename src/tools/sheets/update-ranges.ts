import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface RangeUpdate {
    range: string;
    values: any[][];
}

const updateRanges = async (spreadsheetId: string, updates: RangeUpdate[], auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

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
        },
        async ({spreadsheetId, updates}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await updateRanges(spreadsheetId, updates, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* ranges updated successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to update ranges: ${error}`), tools.updateRanges);
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
