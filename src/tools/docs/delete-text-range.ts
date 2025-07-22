import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const deleteTextRange = async (documentId: string, ranges: { startIndex: number; endIndex: number }[], auth: Auth.OAuth2Client, paragraphNumber?: number) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const requests = ranges.map(({startIndex, endIndex}) => ({
        deleteContentRange: {
            range: {
                startIndex,
                endIndex,
            },
        },
    }));

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteTextRange,
        'Deletes specific content ranges in a Google Docs document using precomputed start and end indices',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            ranges: z
                .array(
                    z.object({
                        startIndex: z.number().describe('Inclusive index where deletion starts'),
                        endIndex: z.number().describe('Exclusive index where deletion ends'),
                    })
                )
                .min(1)
                .describe('One or more index ranges where content should be deleted'),
        },
        async ({documentId, ranges}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await deleteTextRange(documentId, ranges, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* text ranges deleted successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete text range: ${error}`), tools.deleteTextRange);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete text range ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
