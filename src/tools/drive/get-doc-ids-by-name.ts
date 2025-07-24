import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface DocMetadata {
    documentId: string;
    documentName: string;
}

const getDocIdsByName = async (documentName: string, auth: Auth.OAuth2Client): Promise<DocMetadata[]> => {
    const drive = GoogleApiClientFactory.createDriveClient(auth);

    const matchingDocs: DocMetadata[] = [];

    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.document' and name contains '${documentName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files) {
        matchingDocs.push(
            ...response.data.files.map((document: { id?: string | null; name?: string | null }) => ({
                documentId: document.id!,
                documentName: document.name!,
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
            documentName: z.string().describe('The name of the doc to find'),
        },
        async ({documentName}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const docMetadata = await getDocIdsByName(documentName, oauth2Client);

                if (!docMetadata.length) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Docs search for *${documentName}* completed successfully! ✅\n\nFound 0 matches.`,
                            },
                        ],
                    };
                }

                const formattedDocs = docMetadata
                    .map(({documentId, documentName}, index) => `${index + 1}. 📁 ${documentName} → \`${documentId}\``)
                    .join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Docs search for *${documentName}* completed successfully! ✅\n\nFound ${docMetadata.length} match${docMetadata.length !== 1 ? 'es' : ''}:\n${formattedDocs}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get doc IDs by name: ${error}`), tools.getDocIdsByName);
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
