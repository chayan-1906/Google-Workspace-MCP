import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const moveDriveFile = async (fileId: string, newParentFolderId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const file = await drive.files.get({
        fileId: fileId,
        fields: 'parents',
    });

    const previousParents = file.data.parents?.join(',') || '';

    const movedFile = await drive.files.update({
        fileId: fileId,
        addParents: newParentFolderId,
        removeParents: previousParents,
        fields: 'id, name, webViewLink, parents',
    });

    return {
        fileId: movedFile.data.id!,
        name: movedFile.data.name!,
        url: movedFile.data.webViewLink,
        newParent: newParentFolderId,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.moveDriveFile,
        'Moves a file to a different folder in Google Drive',
        {
            fileId: z.string().describe('The ID of the file to move'),
            newParentFolderId: z.string().describe('The ID of the destination folder'),
        },
        async ({fileId, newParentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {fileId: movedFileId, name, url} = await moveDriveFile(fileId, newParentFolderId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File *${name}* moved successfully! ✅\n\n🔗 [Open File](${url})\n🆔 \`${movedFileId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to move file: ${error}`), tools.moveDriveFile);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to move file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
