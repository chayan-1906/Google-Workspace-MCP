import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";
import {Readable} from 'stream';

const exportAndSaveDoc = async (fileId: string, mimeType: string, auth: Auth.OAuth2Client) => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    // Get original doc metadata to get parent folder and name
    const originalFile = await drive.files.get({
        fileId: fileId,
        fields: 'name, parents',
    });

    // Export the document
    const exportResponse = await drive.files.export({
        fileId: fileId,
        mimeType: mimeType,
    }, {responseType: 'stream'});

    // Determine file extension
    const extensionMap: Record<string, string> = {
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'text/plain': '.txt',
        'text/html': '.html',
        'application/rtf': '.rtf',
        'application/vnd.oasis.opendocument.text': '.odt',
        'application/epub+zip': '.epub',
    };

    const extension = extensionMap[mimeType];
    const newFileName = `${originalFile.data.name}${extension}`;

    // Upload exported data to same folder
    const uploadResponse = await drive.files.create({
        requestBody: {
            name: newFileName,
            parents: originalFile.data.parents,
        },
        media: {
            mimeType: mimeType,
            body: exportResponse.data,
        },
        fields: 'id, name, webViewLink, size',
    });

    return {
        originalFileId: fileId,
        exportedFileId: uploadResponse.data.id,
        fileName: uploadResponse.data.name,
        webViewLink: uploadResponse.data.webViewLink,
        size: uploadResponse.data.size,
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.exportDoc,
        'Exports a Google Doc to specified format and saves it in the same Drive folder',
        {
            fileId: z.string().describe('The ID of the Google Doc to export'),
            mimeType: z.enum([
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/html',
                'application/rtf',
                'application/vnd.oasis.opendocument.text',
                'application/epub+zip',
            ]).describe('Export format: PDF, DOCX, TXT, HTML, RTF, ODT, or EPUB'),
        },
        async ({fileId, mimeType}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const result = await exportAndSaveDoc(fileId, mimeType, oauth2Client);

                const formatMap: Record<string, string> = {
                    'application/pdf': 'PDF',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
                    'text/plain': 'TXT',
                    'text/html': 'HTML',
                    'application/rtf': 'RTF',
                    'application/vnd.oasis.opendocument.text': 'ODT',
                    'application/epub+zip': 'EPUB',
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc exported and saved successfully! ✅\n\n📄 Format: ${formatMap[mimeType]}\n📁 File: ${result.fileName}\n🆔 Exported ID: \`${result.exportedFileId}\`\n🔗 [View File](${result.webViewLink})\n📦 Size: ${result.size} bytes`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to export and save doc: ${error}`), tools.exportDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to export and save doc ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
