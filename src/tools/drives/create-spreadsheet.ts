import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

const createSpreadsheet = async (sheetName: string, auth: Auth.OAuth2Client, parentFolderId?: string) => {
    const drive = google.drive({version: 'v3', auth});

    const fileMetadata: any = {
        name: sheetName,
        mimeType: 'application/vnd.google-apps.spreadsheet',
    }

    if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
    }

    const createdSpreadsheet = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
    });

    return {
        spreadsheetId: createdSpreadsheet.data.id!,
        url: createdSpreadsheet.data.webViewLink!,
    }
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.createSpreadsheet,
        'Creates a new Google Spreadsheet in the specified Drive folder',
        {
            sheetName: z.string().describe('The title of the new spreadsheet'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
            parentFolderId: z.string().optional().describe('Optional parent folder ID to place the spreadsheet inside'),
        },
        async ({sheetName, email, parentFolderId}) => {
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

            try {
                const {spreadsheetId, url} = await createSpreadsheet(sheetName, oauthClient, parentFolderId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📄 Spreadsheet *"${sheetName}"* created successfully! 🎉\n\n🔗 [Open Spreadsheet](${url})\n🆔 \`${spreadsheetId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to create spreadsheet: ${error}`), 'create-spreadsheet');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to create spreadsheet ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
