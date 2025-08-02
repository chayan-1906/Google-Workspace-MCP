import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const applyTextStyle = async (documentId: string, startIndex: number, endIndex: number, textStyle: any, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const range: any = {
        startIndex: startIndex,
        endIndex: endIndex,
    };

    if (tabId) {
        range.tabId = tabId;
    }

    const request = {
        updateTextStyle: {
            range: range,
            textStyle: textStyle,
            fields: Object.keys(textStyle).join(','),
        },
    };

    await docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
            requests: [request],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.applyTextStyle,
        'Applies text styling to a range of text in a Google Doc (bold, italic, color, font, etc.)',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            startIndex: z.number().describe('Start index of text range (0-based, inclusive)'),
            endIndex: z.number().describe('End index of text range (0-based, exclusive)'),
            textStyle: z.object({
                bold: z.boolean().optional().describe('Make text bold'),
                italic: z.boolean().optional().describe('Make text italic'),
                underline: z.boolean().optional().describe('Underline text'),
                strikethrough: z.boolean().optional().describe('Strikethrough text'),
                fontSize: z.object({
                    magnitude: z.number().describe('Font size value'),
                    unit: z.enum(['PT']).describe('Font size unit (PT for points)'),
                }).optional().describe('Font size'),
                weightedFontFamily: z.object({
                    fontFamily: z.string().describe('Font family name (e.g., "Arial", "Times New Roman")'),
                }).optional().describe('Font family'),
                foregroundColor: z.object({
                    color: z.object({
                        rgbColor: z.object({
                            red: z.number().min(0).max(1).describe('Red component (0.0-1.0)'),
                            green: z.number().min(0).max(1).describe('Green component (0.0-1.0)'),
                            blue: z.number().min(0).max(1).describe('Blue component (0.0-1.0)'),
                        }),
                    }),
                }).optional().describe('Text color'),
                backgroundColor: z.object({
                    color: z.object({
                        rgbColor: z.object({
                            red: z.number().min(0).max(1).describe('Red component (0.0-1.0)'),
                            green: z.number().min(0).max(1).describe('Green component (0.0-1.0)'),
                            blue: z.number().min(0).max(1).describe('Blue component (0.0-1.0)')
                        }),
                    }),
                }).optional().describe('Background color'),
                link: z.object({
                    url: z.string().url().describe('URL for hyperlink'),
                }).optional().describe('Hyperlink'),
                baselineOffset: z.enum(['NONE', 'SUPERSCRIPT', 'SUBSCRIPT']).optional().describe('Text baseline offset'),
                smallCaps: z.boolean().optional().describe('Small caps formatting'),
            }).describe('Text style properties to apply'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, startIndex, endIndex, textStyle, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await applyTextStyle(documentId, startIndex, endIndex, textStyle, tabId, oauth2Client);

                const appliedStyles = Object.keys(textStyle).join(', ');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Text style applied successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Range: ${startIndex}-${endIndex}\n🎨 Styles: ${appliedStyles}${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to apply text style: ${error}`), tools.applyTextStyle);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to apply text style ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
