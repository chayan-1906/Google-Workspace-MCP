import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const removeAllFormattingDoc = async (documentId: string, startIndex: number, endIndex: number, auth: Auth.OAuth2Client, tabId?: string) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const requests: any[] = [];

    // Remove text formatting
    requests.push({
        updateTextStyle: {
            range: {
                startIndex,
                endIndex,
                segmentId: tabId,
            },
            textStyle: {
                bold: false,
                italic: false,
                underline: false,
                strikethrough: false,
                smallCaps: false,
                baselineOffset: 'NONE',
                backgroundColor: {},
                foregroundColor: {},
            },
            fields: 'bold,italic,underline,strikethrough,smallCaps,baselineOffset,backgroundColor,foregroundColor',
        },
    });

    // Remove paragraph formatting
    requests.push({
        updateParagraphStyle: {
            range: {
                startIndex,
                endIndex,
                segmentId: tabId,
            },
            paragraphStyle: {
                namedStyleType: 'NORMAL_TEXT',
                alignment: 'START',
                lineSpacing: 100,
                direction: 'LEFT_TO_RIGHT',
            },
            fields: 'namedStyleType,alignment,lineSpacing,direction',
        },
    });

    // Remove bullets/numbering
    requests.push({
        deleteParagraphBullets: {
            range: {
                startIndex,
                endIndex,
                segmentId: tabId,
            },
        },
    });

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.removeAllFormattingDoc,
        'Removes all text and paragraph formatting from a range in a Google Doc',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            startIndex: z.number().describe('Start index of text range (0-based, inclusive)'),
            endIndex: z.number().describe('End index of text range (0-based, exclusive)'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, startIndex, endIndex, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await removeAllFormattingDoc(documentId, startIndex, endIndex, oauth2Client, tabId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `All formatting removed successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to remove formatting: ${error}`), tools.removeAllFormattingDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to remove formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
