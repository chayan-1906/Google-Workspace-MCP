import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const deleteDriveFile = async (fileId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    await drive.files.delete({
        fileId: fileId,
    });

    return {
        fileId,
        deleted: true,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteDriveFile,
        'Permanently deletes a file from Google Drive',
        {
            fileId: z.string().describe('The ID of the file to delete'),
        },
        async ({fileId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteDriveFile(fileId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File \`${fileId}\` deleted permanently ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete file: ${error}`), tools.deleteDriveFile);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
