import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";

interface SheetsMetadata {
    sheetId: string;
    sheetName: string;
}

const getSheetIdsByName = async (sheetName: string, auth: Auth.OAuth2Client): Promise<SheetsMetadata[]> => {
    const drive = google.drive({version: 'v3', auth});

    const matchingSheets: SheetsMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${sheetName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingSheets.push(
            ...response.data.files.map(sheet => ({
                sheetId: sheet.id!,
                sheetName: sheet.name!,
            }))
        );
    }

    return matchingSheets;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.sheetIdsByName,
        'Finds the Google Spreadsheet IDs by spreadsheet name',
        {
            sheetsName: z.string().describe('The name of the spreadsheet to find'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({sheetsName, email}) => {
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

            const sheetsMetadata = await getSheetIdsByName(sheetsName, oauthClient);

            if (!sheetsMetadata.length) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No sheets found containing ${sheetsName} 😕`,
                        },
                    ],
                };
            }

            const formattedSheets = sheetsMetadata
                .map(({sheetId, sheetName}, index) => `${index + 1}. 📁 ${sheetName} → \`${sheetId}\``)
                .join('\n');

            return {
                content: [
                    {
                        type: 'text',
                        // text: `${sheetName} found 🎉`,
                        text: `Found ${sheetsMetadata.length} sheet(s) containing ${sheetsName}: 🎉\n\n${formattedSheets}`,
                    },
                ],
            };
        },
    );
}
