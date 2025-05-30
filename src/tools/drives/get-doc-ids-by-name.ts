import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";

interface DocMetadata {
    docId: string;
    docName: string;
}

const getDocIdsByName = async (sheetName: string, auth: Auth.OAuth2Client): Promise<DocMetadata[]> => {
    const {google} = await import('googleapis');
    const drive = google.drive({version: 'v3', auth});

    const matchingDocs: DocMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${sheetName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingDocs.push(
            ...response.data.files.map(doc => ({
                docId: doc.id!,
                docName: doc.name!,
            }))
        );
    }

    return matchingDocs;
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getDocIdsByName,
        'Finds the Google Doc IDs by doc name',
        {
            docName: z.string().describe('The name of the doc to find'),
        },
        async ({docName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const docMetadata = await getDocIdsByName(docName, oauth2Client);

                if (!docMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No docs found containing ${docName} 😕`,
                            },
                        ],
                    };
                }

                const formattedDocs = docMetadata
                    .map(({docId, docName}, index) => `${index + 1}. 📁 ${docName} → \`${docId}\``)
                    .join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Found ${docMetadata.length} doc(s) containing ${docName}: 🎉\n\n${formattedDocs}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get doc IDs by name: ${error}`), 'get-doc-ids-by-name');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get doc IDs by name ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
