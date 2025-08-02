import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const applyParagraphStyle = async (documentId: string, startIndex: number, endIndex: number, paragraphStyle: any, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const range: any = {
        startIndex: startIndex,
        endIndex: endIndex,
    };

    if (tabId) {
        range.tabId = tabId;
    }

    const request = {
        updateParagraphStyle: {
            range: range,
            paragraphStyle: paragraphStyle,
            fields: Object.keys(paragraphStyle).join(','),
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
        tools.applyParagraphStyle,
        'Applies paragraph styling to a range of text in a Google Doc (alignment, spacing, indentation, etc.)',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            startIndex: z.number().describe('Start index of text range (0-based, inclusive)'),
            endIndex: z.number().describe('End index of text range (0-based, exclusive)'),
            paragraphStyle: z.object({
                namedStyleType: z.enum([
                    'NORMAL_TEXT',
                    'TITLE',
                    'SUBTITLE',
                    'HEADING_1',
                    'HEADING_2',
                    'HEADING_3',
                    'HEADING_4',
                    'HEADING_5',
                    'HEADING_6',
                ]).optional().describe('Named paragraph style'),
                alignment: z.enum(['START', 'CENTER', 'END', 'JUSTIFIED']).optional().describe('Text alignment'),
                lineSpacing: z.number().optional().describe('Line spacing as percentage (100 = single, 200 = double)'),
                spaceAbove: z.object({
                    magnitude: z.number().describe('Space value'),
                    unit: z.enum(['PT']).describe('Unit (PT for points)'),
                }).optional().describe('Space above paragraph'),
                spaceBelow: z.object({
                    magnitude: z.number().describe('Space value'),
                    unit: z.enum(['PT']).describe('Unit (PT for points)'),
                }).optional().describe('Space below paragraph'),
                indentFirstLine: z.object({
                    magnitude: z.number().describe('Indent value'),
                    unit: z.enum(['PT']).describe('Unit (PT for points)'),
                }).optional().describe('First line indent'),
                indentStart: z.object({
                    magnitude: z.number().describe('Indent value'),
                    unit: z.enum(['PT']).describe('Unit (PT for points)'),
                }).optional().describe('Left indent'),
                indentEnd: z.object({
                    magnitude: z.number().describe('Indent value'),
                    unit: z.enum(['PT']).describe('Unit (PT for points)'),
                }).optional().describe('Right indent'),
                keepLinesTogether: z.boolean().optional().describe('Keep lines together'),
                keepWithNext: z.boolean().optional().describe('Keep with next paragraph'),
                avoidWidowAndOrphan: z.boolean().optional().describe('Avoid widow and orphan lines'),
                direction: z.enum(['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT']).optional().describe('Text direction'),
            }).describe('Paragraph style properties to apply'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, startIndex, endIndex, paragraphStyle, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await applyParagraphStyle(documentId, startIndex, endIndex, paragraphStyle, tabId, oauth2Client);

                const appliedStyles = Object.keys(paragraphStyle).join(', ');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Paragraph style applied successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Range: ${startIndex}-${endIndex}\n🎨 Styles: ${appliedStyles}${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to apply paragraph style: ${error}`), tools.applyParagraphStyle);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to apply paragraph style ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
