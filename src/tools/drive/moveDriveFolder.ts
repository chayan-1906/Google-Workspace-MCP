import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const moveDriveFolder = async (folderId: string, newParentFolderId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const folder = await drive.files.get({
        fileId: folderId,
        fields: 'parents',
    });

    const previousParents = folder.data.parents?.join(',') || '';

    // Move folder
    const movedFolder = await drive.files.update({
        fileId: folderId,
        addParents: newParentFolderId,
        removeParents: previousParents,
        fields: 'id, name, webViewLink, parents',
    });

    return {
        folderId: movedFolder.data.id!,
        name: movedFolder.data.name!,
        url: movedFolder.data.webViewLink!,
        newParent: newParentFolderId,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.moveDriveFolder,
        'Moves a folder to a different location in Google Drive',
        {
            folderId: z.string().describe('The ID of the folder to move'),
            newParentFolderId: z.string().describe('The ID of the destination parent folder'),
        },
        async ({folderId, newParentFolderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {folderId: movedFolderId, name, url} = await moveDriveFolder(folderId, newParentFolderId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Folder *${name}* moved successfully! ✅\n\n🔗 [Open Folder](${url})\n🆔 \`${movedFolderId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to move folder: ${error}`), tools.moveDriveFolder);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to move folder ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
