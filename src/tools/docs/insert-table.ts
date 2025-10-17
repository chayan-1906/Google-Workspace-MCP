import {z} from "zod"
import type {Auth} from 'googleapis'
import {OAuth2Client} from 'googleapis-common'
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"
import {sendError} from "mcp-utils/utils"
import {transport} from "../../server"
import {tools} from "../../utils/constants"
import {getOAuth2ClientFromEmail} from "../../services/OAuth"
import {GoogleApiClientFactory} from "../../services/GoogleApiClients"

const insertTable = async (documentId: string, index: number, rows: number, columns: number, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth)

    const location: any = {
        index: index,
    }

    if (tabId) {
        location.tabId = tabId
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    insertTable: {
                        location: location,
                        rows: rows,
                        columns: columns,
                    },
                },
            ],
        },
    })
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.insertTable,
        'Inserts a table with specified rows and columns at a given position in a Google Docs document',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            index: z.number().describe('The position index where the table should be inserted (0-based)'),
            rows: z.number().min(1).max(20).describe('Number of rows for the table (1-20)'),
            columns: z.number().min(1).max(20).describe('Number of columns for the table (1-20)'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, index, rows, columns, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser)
            if (!oauth2Client) return response

            try {
                await insertTable(documentId, index, rows, columns, tabId, oauth2Client)

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Table inserted successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Position: ${index}\n📊 Size: ${rows} rows × ${columns} columns${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                }
            } catch (error: any) {
                sendError(transport, new Error(`Failed to insert table: ${error}`), tools.insertTable)
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to insert table ❌: ${error.message}`,
                        },
                    ],
                }
            }
        },
    )
}
