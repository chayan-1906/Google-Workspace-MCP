import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const updateTable = async (documentId: string, tableStartIndex: number, operation: string, rowIndex: number | undefined, columnIndex: number | undefined, cellContent: string | undefined, insertCount: number | undefined, tabId: string | undefined, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth)

    const requests: any[] = [];

    if (operation === 'insertRows' && rowIndex !== undefined && insertCount !== undefined) {
        const location: any = {
            tableStartLocation: {
                index: tableStartIndex,
            },
            rowIndex: rowIndex,
        };

        if (tabId) {
            location.tableStartLocation.tabId = tabId;
        }

        requests.push({
            insertTableRow: {
                tableCellLocation: location,
                insertBelow: true,
            },
        });

        for (let i = 1; i < insertCount; i++) {
            requests.push({
                insertTableRow: {
                    tableCellLocation: location,
                    insertBelow: true,
                },
            });
        }
    } else if (operation === 'insertColumns' && columnIndex !== undefined && insertCount !== undefined) {
        const location: any = {
            tableStartLocation: {
                index: tableStartIndex,
            },
            columnIndex: columnIndex,
        };

        if (tabId) {
            location.tableStartLocation.tabId = tabId;
        }

        requests.push({
            insertTableColumn: {
                tableCellLocation: location,
                insertRight: true,
            },
        });

        for (let i = 1; i < insertCount; i++) {
            requests.push({
                insertTableColumn: {
                    tableCellLocation: location,
                    insertRight: true,
                },
            });
        }
    } else if (operation === 'deleteRows' && rowIndex !== undefined && insertCount !== undefined) {
        const location: any = {
            tableStartLocation: {
                index: tableStartIndex,
            },
            rowIndex: rowIndex,
        };

        if (tabId) {
            location.tableStartLocation.tabId = tabId;
        }

        for (let i = 0; i < insertCount; i++) {
            requests.push({
                deleteTableRow: {
                    tableCellLocation: location,
                },
            });
        }
    } else if (operation === 'deleteColumns' && columnIndex !== undefined && insertCount !== undefined) {
        const location: any = {
            tableStartLocation: {
                index: tableStartIndex,
            },
            columnIndex: columnIndex,
        };

        if (tabId) {
            location.tableStartLocation.tabId = tabId;
        }

        for (let i = 0; i < insertCount; i++) {
            requests.push({
                deleteTableColumn: {
                    tableCellLocation: location,
                },
            });
        }
    } else if (operation === 'updateCell' && rowIndex !== undefined && columnIndex !== undefined && cellContent !== undefined) {
        const doc = await docs.documents.get({documentId})
        const content = doc.data.body?.content || []

        let table = null
        for (const element of content) {
            if (element.startIndex === tableStartIndex && element.table) {
                table = element.table;
                break;
            }
        }

        if (!table) {
            throw new Error('Table not found at the specified index');
        }

        const row = table.tableRows?.[rowIndex]
        if (!row) {
            throw new Error(`Row ${rowIndex} not found in table`);
        }

        const cell = row.tableCells?.[columnIndex];
        if (!cell) {
            throw new Error(`Column ${columnIndex} not found in row ${rowIndex}`);
        }

        const cellStartIndex = cell.startIndex;
        const cellEndIndex = cell.endIndex;

        if (cellStartIndex === undefined || cellEndIndex === undefined) {
            throw new Error('Unable to determine cell indices');
        }

        requests.push({
            deleteContentRange: {
                range: {
                    startIndex: cellStartIndex,
                    endIndex: cellEndIndex - 1,
                },
            },
        });

        requests.push({
            insertText: {
                location: {
                    index: cellStartIndex,
                },
                text: cellContent,
            },
        });
    }

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.updateTable,
        'Updates a table in a Google Docs document by inserting/deleting rows/columns or updating cell content',
        {
            documentId: z.string().describe('The ID of the Google Doc'),
            tableStartIndex: z.number().describe('The start index of the table in the document'),
            operation: z.enum(['insertRows', 'insertColumns', 'deleteRows', 'deleteColumns', 'updateCell']).describe('The operation to perform on the table'),
            rowIndex: z.number().optional().describe('Row index (0-based, required for row operations and updateCell)'),
            columnIndex: z.number().optional().describe('Column index (0-based, required for column operations and updateCell)'),
            cellContent: z.string().optional().describe('New content for the cell (required for updateCell operation)'),
            insertCount: z.number().min(1).optional().describe('Number of rows/columns to insert or delete (required for insert/delete operations, default: 1)'),
            tabId: z.string().optional().describe('Tab ID if document has multiple tabs'),
        },
        async ({documentId, tableStartIndex, operation, rowIndex, columnIndex, cellContent, insertCount, tabId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await updateTable(documentId, tableStartIndex, operation, rowIndex, columnIndex, cellContent, insertCount || 1, tabId, oauth2Client);

                let operationDesc = ''
                if (operation === 'insertRows') {
                    operationDesc = `Inserted ${insertCount || 1} row(s) at index ${rowIndex}`;
                } else if (operation === 'insertColumns') {
                    operationDesc = `Inserted ${insertCount || 1} column(s) at index ${columnIndex}`;
                } else if (operation === 'deleteRows') {
                    operationDesc = `Deleted ${insertCount || 1} row(s) at index ${rowIndex}`;
                } else if (operation === 'deleteColumns') {
                    operationDesc = `Deleted ${insertCount || 1} column(s) at index ${columnIndex}`;
                } else if (operation === 'updateCell') {
                    operationDesc = `Updated cell at row ${rowIndex}, column ${columnIndex}`;
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Table updated successfully! ✅\n\n📄 Document: \`${documentId}\`\n📍 Table Start: ${tableStartIndex}\n🔧 Operation: ${operationDesc}${tabId ? `\n📑 Tab: ${tabId}` : ''}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to update table: ${error}`), tools.updateTable)
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to update table ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
