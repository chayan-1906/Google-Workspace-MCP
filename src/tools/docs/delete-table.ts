import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const deleteTable = async (documentId: string, tableStartIndex: number, tableEndIndex: number, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const range: any = {
        startIndex: tableStartIndex,
        endIndex: tableEndIndex,
    };

    if (tabId) {
        range.tabId = tabId;
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    deleteContentRange: {
                        range: range,
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteTable,
        'Deletes a table from a Google Docs document by specifying its start and end index',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            tableStartIndex: z.number().describe('The start index of the table to delete'),
            tableEndIndex: z.number().describe('The end index of the table to delete'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, tableStartIndex, tableEndIndex, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser)
            if (!oauth2Client) return response

            try {
                await deleteTable(documentId, tableStartIndex, tableEndIndex, tabId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Table deleted successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Removed Range: ${tableStartIndex}-${tableEndIndex}${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete table: ${error}`), tools.deleteTable)
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to delete table ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
