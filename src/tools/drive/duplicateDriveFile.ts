import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const duplicateDriveFile = async (fileId: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const originalFile = await drive.files.get({
        fileId: fileId,
        fields: 'name, parents',
    });

    const duplicatedFile = await drive.files.copy({
        fileId: fileId,
        requestBody: {
            name: `Copy of ${originalFile.data.name}`,
            parents: originalFile.data.parents,
        },
        fields: 'id, name, webViewLink',
    });

    return {
        fileId: duplicatedFile.data.id!,
        name: duplicatedFile.data.name!,
        url: duplicatedFile.data.webViewLink!,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.duplicateDriveFile,
        'Duplicates a file in the same folder with "Copy of" prefix',
        {
            fileId: z.string().describe('The ID of the file to duplicate'),
        },
        async ({fileId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {fileId: duplicatedFileId, name, url} = await duplicateDriveFile(fileId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `File *${name}* duplicated ✅\n🔗 [Open](${url})\n🆔 \`${duplicatedFileId}\``,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to duplicate file: ${error}`), tools.duplicateDriveFile);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to duplicate file ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
