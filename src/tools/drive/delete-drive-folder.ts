import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const deleteDriveFolder = async (folderId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    await drive.files.delete({
        fileId: folderId,
    });

    return {
        folderId,
        deleted: true,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteDriveFolder,
        'Permanently deletes a folder from Google Drive',
        {
            folderId: z.string().describe('The ID of the folder to delete'),
        },
        async ({folderId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteDriveFolder(folderId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Folder \`${folderId}\` deleted permanently ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete folder: ${error}`), tools.deleteDriveFolder);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete folder ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
