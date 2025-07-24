import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const extractTextFromContent = (content: any[]): string => {
    let text = '';

    for (const element of content) {
        if (element.paragraph) {
            for (const elem of element.paragraph.elements || []) {
                if (elem.textRun?.content) {
                    text += elem.textRun.content;
                }
            }
        }

        if (element.table) {
            for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                    text += extractTextFromContent(cell.content || []);
                }
            }
        }

        if (element.tableOfContents) {
            text += extractTextFromContent(element.tableOfContents.content || []);
        }
    }

    return text;
}

const getDocContent = async (documentId: string, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const res = await docs.documents.get({documentId});
    const content = res.data.body?.content || [];

    return extractTextFromContent(content);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDocContent,
        'Retrieves the plain text content of a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
        },
        async ({documentId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const text = await getDocContent(documentId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* content retrieved successfully! ✅\n\n${text.trim() || '[Document is empty]'}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get document content: ${error}`), tools.getDocContent);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get document content ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
