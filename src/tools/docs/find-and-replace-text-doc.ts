import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

// TODO: Use findTextIndices
async function findAndReplaceTextDoc(documentId: string, searchString: string, replaceString: string, auth: Auth.OAuth2Client): Promise<void> {
    if (!searchString) {
        return;
    }

    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    const doc = await docs.documents.get({documentId});
    const content = doc.data.body?.content || [];

    for (const element of content) {
        if (element.paragraph && element.paragraph.elements) {
            for (const paragraphElement of element.paragraph.elements) {
                if (paragraphElement.textRun && paragraphElement.textRun.content && paragraphElement.startIndex !== undefined) {
                    const text = paragraphElement.textRun.content;
                    const startIndex = paragraphElement.startIndex;
                }
            }
        }
    }

    // Replace all occurrences
    await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [
                    {
                        replaceAllText: {
                            containsText: {
                                text: searchString,
                                matchCase: true,
                            },
                            replaceText: replaceString,
                        },
                    },
                ],
            },
        });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.findAndReplaceTextDoc,
        'Finds and replaces a specific or all occurrences of a string in a Google Doc',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            searchString: z.string().describe('Text to search for'),
            newText: z.string().describe('Text to replace with'),
        },
        async ({documentId, searchString, newText}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await findAndReplaceTextDoc(documentId, searchString, newText, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Replaced all occurrences of ${searchString} with ${newText} ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to replace text: ${error}`), 'find-and-replace-text-doc');
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
