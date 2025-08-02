import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const setListStyle = async (documentId: string, startIndex: number, endIndex: number, listType: string, auth: Auth.OAuth2Client, tabId?: string) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const requests: any[] = [];

    if (listType === 'NONE') {
        requests.push({
            deleteParagraphBullets: {
                range: {
                    startIndex,
                    endIndex,
                    segmentId: tabId,
                },
            },
        });
    } else {
        requests.push({
            createParagraphBullets: {
                range: {
                    startIndex,
                    endIndex,
                    segmentId: tabId,
                },
                bulletPreset: listType,
            },
        });
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.setListStyle,
        'Applies list formatting (bullets or numbering) to a range of text in a Google Doc',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            startIndex: z.number().describe('Start index of text range (0-based, inclusive)'),
            endIndex: z.number().describe('End index of text range (0-based, exclusive)'),
            listType: z.enum(['BULLET_DISC_CIRCLE_SQUARE', 'BULLET_DIAMONDX_ARROW3D_SQUARE', 'BULLET_CHECKBOX', 'BULLET_ARROW_DIAMOND_DISC', 'NUMBERED_DECIMAL_ALPHA_ROMAN', 'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS', 'NUMBERED_DECIMAL_NESTED', 'NUMBERED_UPPERALPHA_ALPHA_ROMAN', 'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL', 'NONE']).describe('List style preset to apply, or NONE to remove list formatting'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, startIndex, endIndex, listType, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await setListStyle(documentId, startIndex, endIndex, listType, oauth2Client, tabId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `List style applied successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to set list style: ${error}`), tools.setListStyle);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set list style ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
