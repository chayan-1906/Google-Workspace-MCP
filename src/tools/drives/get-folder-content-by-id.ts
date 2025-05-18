import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {Auth, google} from "googleapis";
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

interface FolderMetadata {
    fileId: string;
    mimeType: string;
    fileName: string;
}

function getReadableMimeType(mimeType: string): string {
    const map: Record<string, string> = {
        'application/vnd.google-apps.document': 'Google Docs',
        'application/vnd.google-apps.spreadsheet': 'Google Sheet',
        'application/vnd.google-apps.presentation': 'Google Slides',
        'application/vnd.google-apps.form': 'Google Forms',
    };
    return map[mimeType] ?? mimeType ?? 'unknown';
}

const getFolderContentById = async (folderId: string, auth: Auth.OAuth2Client): Promise<FolderMetadata[]> => {
    const drive = google.drive({version: 'v3', auth});

    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, mimeType, name)',
    });

    return response.data.files?.map(file => ({
        fileId: file.id!,
        mimeType: getReadableMimeType(file.mimeType!),
        fileName: file.name!,
    })) ?? [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.folderContentById,
        'Finds the Google Drive folder contents by folder ID',
        {
            folderId: z.string().describe('The ID of the Google Drive folder to list contents from'),
            email: z.string().describe('The authenticated user\'s email, used to check right access'),
        },
        async ({folderId, email}) => {
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
                const folderMetadata = await getFolderContentById(folderId, oauthClient);

                if (!folderMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No files found in this folder',
                            },
                        ],
                    };
                }

                const formattedFolderContent = folderMetadata
                    .map(({fileId, mimeType, fileName}, index) => `${index + 1}. 📁 ${fileName} → \`${fileId}\` (${mimeType})`)
                    .join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            // text: `${folderName} found 🎉`,
                            text: `Here are the contents of the folder: 🎉\n\n${formattedFolderContent}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch content of folder: ${error}`), 'get-sheet-content');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch content of folder ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
