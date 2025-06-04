import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

const insertTextAtPosition = async (documentId: string, targetText: string, textToInsert: string, auth: Auth.OAuth2Client) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const doc = await docs.documents.get({documentId});
    const fullText = doc.data.body?.content
        ?.map(el => el.paragraph?.elements?.map(e => e.textRun?.content || '').join(''))
        .join('') || '';

    const targetIndex = fullText.indexOf(targetText);
    if (targetIndex === -1) throw new Error('Target text not found');

    const insertIndex = targetIndex + targetText.length + 1;

    const nextChar = fullText.charAt(insertIndex);
    const spaceNeeded = nextChar && !nextChar.match(/\s/) && !textToInsert.startsWith(' ');

    const textToInsertFixed = spaceNeeded ? ' ' + textToInsert : textToInsert;

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    insertText: {
                        location: {index: insertIndex},
                        text: textToInsertFixed
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertTextAtPosition,
        'Inserts text at a specific position in a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            targetText: z.string().describe('The text to target'),
            textToInsert: z.string().describe('The text to insert'),
        },
        async ({documentId, targetText, textToInsert}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await insertTextAtPosition(documentId, targetText, textToInsert, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Text inserted after ${targetText} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert text: ${error}`), 'insert-text-at-position');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get insert text ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
