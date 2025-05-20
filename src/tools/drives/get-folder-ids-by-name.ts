import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

interface FolderMetadata {
    folderId: string;
    folderName: string;
}

const getFolderIdsByName = async (folderName: string, auth: Auth.OAuth2Client): Promise<FolderMetadata[]> => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const matchingFolders: FolderMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name contains '${folderName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingFolders.push(
            ...response.data.files.map(folder => ({
                folderId: folder.id!,
                folderName: folder.name!,
            }))
        );
    }

    return matchingFolders;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.folderIdsByName,
        'Finds the Google Drive folder IDs by folder name',
        {
            folderName: z.string().describe('The name of the Google Drive folder to find'),
        },
        async ({folderName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const folderMetadata = await getFolderIdsByName(folderName, oauth2Client);

                if (!folderMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No folders found containing ${folderName} 😕`,
                            },
                        ],
                    };
                }

                const formattedFolders = folderMetadata
                    .map(({folderId, folderName}, index) => `${index + 1}. 📁 ${folderName} → \`${folderId}\``)
                    .join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            // text: `${folderName} found 🎉`,
                            text: `Found ${folderMetadata.length} folder(s) containing ${folderName}: 🎉\n\n${formattedFolders}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch ID of folder by name: ${error}`), 'get-folder-id-by-name');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch ID of folder by name ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
