import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const getDocMetadata = async (documentId: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});
    const res = await drive.files.get({
        fileId: documentId,
        fields: "id, name, createdTime, modifiedTime, owners(emailAddress)",
    });

    return {
        id: res.data.id,
        title: res.data.name,
        owners: res.data.owners?.map(owner => owner.emailAddress) || [],
        createdTime: res.data.createdTime,
        modifiedTime: res.data.modifiedTime,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDocMetadata,
        'Fetches basic metadata for a Google Doc (title, timestamps, owners)',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
        },
        async ({documentId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const {id, title, owners, createdTime, modifiedTime} = await getDocMetadata(documentId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `📄 Title: ${title}\n🆔 ID: ${id}\n🕒 Created: ${createdTime}\n🕒 Modified: ${modifiedTime}\n👤 Owners: ${owners.join(', ')}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch doc metadata: ${error}`), 'get-doc-metadata');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch doc metadata ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
