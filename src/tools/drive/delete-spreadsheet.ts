import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const deleteSpreadsheet = async (spreadsheetId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    await drive.files.delete({
        fileId: spreadsheetId,
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteSpreadsheet,
        'Deletes a Google Spreadsheet from Drive permanently',
        {
            spreadsheetId: z.string().describe('The ID of the spreadsheet to delete'),
        },
        async ({spreadsheetId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteSpreadsheet(spreadsheetId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Spreadsheet *${spreadsheetId}* deleted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete spreadsheet: ${error}`), tools.deleteSpreadsheet);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
