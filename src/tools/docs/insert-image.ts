import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const insertImage = async (documentId: string, index: number, imageUri: string, width: number | undefined, height: number | undefined, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const location: any = {
        index: index,
    };

    if (tabId) {
        location.tabId = tabId;
    }

    const imageRequest: any = {
        insertInlineImage: {
            location: location,
            uri: imageUri,
        },
    };

    if (width !== undefined || height !== undefined) {
        imageRequest.insertInlineImage.objectSize = {
            height: {},
            width: {},
        };

        if (height !== undefined) {
            imageRequest.insertInlineImage.objectSize.height = {
                magnitude: height,
                unit: 'PT',
            };
        }

        if (width !== undefined) {
            imageRequest.insertInlineImage.objectSize.width = {
                magnitude: width,
                unit: 'PT',
            };
        }
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [imageRequest],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertImage,
        'Inserts an image from a URL into a Google Docs document at a specified position. Supports both public URLs and data URIs',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            index: z.number().describe('The position index where the image should be inserted (0-based)'),
            imageUri: z.string().url().describe('The URI of the image to insert. Must be a publicly accessible URL (http/https) or a data URI (data:image/png;base64,...)'),
            width: z.number().positive().optional().describe('Optional width of the image in points (PT). If not specified, uses image natural width'),
            height: z.number().positive().optional().describe('Optional height of the image in points (PT). If not specified, uses image natural height'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, index, imageUri, width, height, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await insertImage(documentId, index, imageUri, width, height, tabId, oauth2Client);

                const dimensions = (width || height)
                    ? `\n📏 Dimensions: ${width ? `${width}pt width` : ''}${width && height ? ' × ' : ''}${height ? `${height}pt height` : ''}`
                    : '';

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Image inserted successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Position: ${index}\n🖼️  Image URI: ${imageUri.substring(0, 100)}${imageUri.length > 100 ? '...' : ''}${dimensions}${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert image: ${error}`), tools.insertImage);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert image ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
