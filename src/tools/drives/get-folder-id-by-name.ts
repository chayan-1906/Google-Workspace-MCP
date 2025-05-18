import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";

interface FolderMetadata {
    folderId: string;
    folderName: string;
}

const getFolderIdsByName = async (folderName: string, auth: Auth.OAuth2Client): Promise<FolderMetadata[]> => {
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
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({folderName, email}) => {
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

            const folderMetadata = await getFolderIdsByName(folderName, oauthClient);

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
        },
    );
}
