import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface SheetsMetadata {
    sheetId: string;
    sheetName: string;
}

const getSheetIdsByName = async (sheetName: string, auth: Auth.OAuth2Client): Promise<SheetsMetadata[]> => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const matchingSheets: SheetsMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${sheetName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingSheets.push(
            ...response.data.files.map((sheet: { id?: string | null; name?: string | null }) => ({
                sheetId: sheet.id!,
                sheetName: sheet.name!,
            }))
        );
    }

    return matchingSheets;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getSheetIdsByName,
        'Finds the Google Spreadsheet IDs by spreadsheet name',
        {
            sheetName: z.string().describe('The name of the spreadsheet to find'),
        },
        async ({sheetName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const sheetsMetadata = await getSheetIdsByName(sheetName, oauth2Client);

                if (!sheetsMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Sheets search for *${sheetName}* completed successfully! ✅\n\nFound 0 matches.`,
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
                            text: `Sheets search for *${sheetName}* completed successfully! ✅\n\nFound ${sheetsMetadata.length} match${sheetsMetadata.length !== 1 ? 'es' : ''}:\n${formattedSheets}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get sheet IDs by name: ${error}`), tools.getSheetIdsByName);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get sheet IDs by name ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
