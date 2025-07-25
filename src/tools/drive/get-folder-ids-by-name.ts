import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface FolderMetadata {
    folderId: string;
    folderName: string;
}

const getFolderIdsByName = async (folderName: string, auth: Auth.OAuth2Client): Promise<FolderMetadata[]> => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const matchingFolders: FolderMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name contains '${folderName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingFolders.push(
            ...response.data.files.map((folder: { id?: string | null; name?: string | null }) => ({
                folderId: folder.id!,
                folderName: folder.name!,
            }))
        );
    }

    return matchingFolders;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getFolderIdsByName,
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
                                text: `Folders search for *${folderName}* completed successfully! ✅\n\nFound 0 matches.`,
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
                            text: `Folders search for *${folderName}* completed successfully! ✅\n\nFound ${folderMetadata.length} match${folderMetadata.length !== 1 ? 'es' : ''}:\n${formattedFolders}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch IDs of folder by name: ${error}`), tools.getFolderIdsByName);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch IDs of folder by name ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
