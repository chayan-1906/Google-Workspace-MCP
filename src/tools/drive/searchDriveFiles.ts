import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const searchDriveFiles = async (query: string, auth: Auth.OAuth2Client, pageSize: number = 10, mimeType?: string) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    let searchQuery = query;
    if (mimeType) {
        searchQuery = `${query} and mimeType='${mimeType}'`;
    }

    const response = await drive.files.list({
        q: searchQuery,
        pageSize: pageSize,
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, parents)',
        orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.searchDriveFiles,
        'Searches for files in Google Drive using query parameters',
        {
            query: z.string().describe('Search query (e.g., "name contains \'report\'" or "modifiedTime > \'2024-01-01\'")'),
            pageSize: z.number().optional().default(10).describe('Number of results to return (max 100)'),
            mimeType: z.string().optional().describe('Filter by specific MIME type (e.g., "application/pdf")'),
        },
        async ({query, pageSize, mimeType}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const files = await searchDriveFiles(query, oauth2Client, pageSize, mimeType);

                if (files.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No files found matching query: "${query}" 🔍`,
                            },
                        ],
                    };
                }

                const fileList = files.map((file: { id?: string | null; name?: string | null; mimeType?: string | null; modifiedTime?: string | null; webViewLink?: string | null }) =>
                    `📄 **${file.name}**\n🆔 \`${file.id}\`\n📁 Type: ${file.mimeType}\n📅 Modified: ${file.modifiedTime}\n🔗 [Open](${file.webViewLink})\n`
                ).join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Found ${files.length} file(s) matching query: "${query}" 🔍\n\n${fileList}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to search files: ${error}`), tools.searchDriveFiles);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to search files ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
