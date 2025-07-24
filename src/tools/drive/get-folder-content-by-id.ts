import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

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
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, mimeType, name)',
    });

    return response.data.files?.map((file: { id?: string | null; mimeType?: string | null; name?: string | null }) => ({
        fileId: file.id!,
        mimeType: getReadableMimeType(file.mimeType!),
        fileName: file.name!,
    })) ?? [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getFolderContentById,
        'Finds the Google Drive folder contents by folder ID',
        {
            folderId: z.string().describe('The ID of the Google Drive folder to list contents from'),
        },
        async ({folderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const folderMetadata = await getFolderContentById(folderId, oauth2Client);

                if (!folderMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Folder *${folderId}* content retrieved successfully! ✅\n\nFound 0 files.`,
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
                            text: `Folder *${folderId}* content retrieved successfully! ✅\n\nFound ${folderMetadata.length} file${folderMetadata.length !== 1 ? 's' : ''}:\n${formattedFolderContent}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch content of folder: ${error}`), tools.getFolderContentById);
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
