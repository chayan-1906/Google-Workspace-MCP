import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

async function findAndReplaceTextDoc(documentId: string, ranges: { startIndex: number; endIndex: number }[], replaceString: string, auth: Auth.OAuth2Client): Promise<void> {
    if (!ranges.length) return;

    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const requests: any[] = [];
    for (const {startIndex, endIndex} of ranges.slice().reverse()) {
        requests.push({
            deleteContentRange: {range: {startIndex, endIndex}},
        });
        requests.push({
            insertText: {location: {index: startIndex}, text: replaceString},
        });
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {requests},
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.findAndReplaceTextDoc,
        'Replaces text at specified index ranges in a Google Docs document with a provided replacement string, using precomputed start/end indices',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            ranges: z
                .array(
                    z.object({
                        startIndex: z.number().describe('Zero-based index where replacement begins (inclusive)'),
                        endIndex: z.number().nonnegative().describe('Zero-based index where replacement ends (exclusive)')
                    })
                ).describe('Array of {startIndex, endIndex} pairs specifying exact ranges to replace'),
            replaceString: z.string().describe('Text to replace with'),
        },
        async ({documentId, ranges, replaceString}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await findAndReplaceTextDoc(documentId, ranges, replaceString, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* text replaced successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to replace text: ${error}`), tools.findAndReplaceTextDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to replace text ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
