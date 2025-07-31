import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const removeDocHyperlinks = async (documentId: string, auth: Auth.OAuth2Client, searchText?: string, removeAll: boolean = false, occurrence?: number) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    // Get the document content to find hyperlinks
    const doc = await docs.documents.get({documentId});
    const content = doc.data.body?.content || [];

    const requests: any[] = [];

    // Helper function to find links in content elements
    const findLinksInContent = (elements: any[], baseIndex: number = 0) => {
        const links: Array<{ startIndex: number, endIndex: number, text: string }> = [];

        for (const element of elements) {
            if (element.paragraph) {
                for (const elem of element.paragraph.elements || []) {
                    if (elem.textRun?.content && elem.textRun.textStyle?.link) {
                        const startIndex = elem.startIndex + baseIndex;
                        const endIndex = elem.endIndex + baseIndex;
                        const text = elem.textRun.content;

                        // If searchText is provided, only include links that contain the search text
                        if (!searchText || text.includes(searchText)) {
                            links.push({startIndex, endIndex, text});
                        }
                    }
                }
            }

            // Handle tables
            if (element.table) {
                for (const row of element.table.tableRows || []) {
                    for (const cell of row.tableCells || []) {
                        const cellLinks = findLinksInContent(cell.content || [], baseIndex);
                        links.push(...cellLinks);
                    }
                }
            }
        }

        return links;
    };

    const allLinks = findLinksInContent(content);

    if (allLinks.length === 0) {
        throw new Error(searchText ?
            `No hyperlinks found containing text "${searchText}"` :
            'No hyperlinks found in the document'
        );
    }

    // Sort links by startIndex in ascending order to maintain consistent ordering
    allLinks.sort((a, b) => a.startIndex - b.startIndex);

    let linksToRemove: typeof allLinks = [];

    if (removeAll) {
        linksToRemove = allLinks;
    } else if (searchText && occurrence) {
        // Filter links that match the search text
        const matchingLinks = allLinks.filter(link => link.text.includes(searchText));

        if (matchingLinks.length === 0) {
            throw new Error(`No hyperlinks found containing text "${searchText}"`);
        }

        if (occurrence > matchingLinks.length) {
            throw new Error(`Only ${matchingLinks.length} hyperlink(s) found containing "${searchText}", but you requested occurrence ${occurrence}`);
        }

        // Get the specific occurrence (1-based index)
        linksToRemove = [matchingLinks[occurrence - 1]];
    } else if (searchText && !occurrence) {
        // Remove all links containing the search text (original behavior)
        linksToRemove = allLinks.filter(link => link.text.includes(searchText));
    }

    if (linksToRemove.length === 0) {
        throw new Error(`No hyperlinks found matching the criteria`);
    }

    // Sort in descending order by startIndex to avoid index shifting issues during removal
    linksToRemove.sort((a, b) => b.startIndex - a.startIndex);

    // Create requests to remove links (update text style to remove link property)
    for (const link of linksToRemove) {
        requests.push({
            updateTextStyle: {
                range: {
                    startIndex: link.startIndex,
                    endIndex: link.endIndex,
                },
                textStyle: {
                    link: null, // Remove the link
                },
                fields: 'link',
            },
        });
    }

    // Execute the batch update
    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests,
        },
    });

    return {
        removedCount: requests.length,
        links: linksToRemove.map(link => ({
            text: link.text.trim(),
            startIndex: link.startIndex,
            endIndex: link.endIndex,
        })),
    };
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.removeDocHyperlinks,
        'Removes hyperlinks from text in a Google Docs document. Can remove all hyperlinks or only those containing specific text',
        {
            documentId: z.string().describe('The ID for the Google Docs document to modify'),
            searchText: z.string().optional().describe('Optional text to search for. Only hyperlinks containing this text will be removed. If not provided, you must set removeAll to true.'),
            removeAll: z.boolean().optional().default(false).describe('Set to true to remove all hyperlinks in the document. Required if searchText is not provided.'),
            occurrence: z.number().optional().describe('Optional: Which occurrence of the searchText to remove (1-based). If not provided, removes all occurrences of searchText.'),
        },
        async ({documentId, searchText, removeAll, occurrence}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            // Validation: either searchText or removeAll must be provided
            if (!searchText && !removeAll) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Please provide either 'searchText' to remove specific hyperlinks or set 'removeAll' to true to remove all hyperlinks ❌`,
                        },
                    ],
                };
            }

            // Validation: occurrence can only be used with searchText
            if (occurrence && !searchText) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `The 'occurrence' parameter can only be used together with 'searchText' ❌`,
                        },
                    ],
                };
            }

            try {
                const result = await removeDocHyperlinks(documentId, oauth2Client, searchText, removeAll, occurrence);

                const linksList = result.links.map((link, index) =>
                    `${index + 1}. "${link.text}" (position ${link.startIndex}-${link.endIndex})`
                ).join('\n');

                let actionDescription: string;
                if (removeAll) {
                    actionDescription = 'All hyperlinks';
                } else if (searchText && occurrence) {
                    actionDescription = `${occurrence}${occurrence === 1 ? 'st' : occurrence === 2 ? 'nd' : occurrence === 3 ? 'rd' : 'th'} hyperlink containing "${searchText}"`;
                } else {
                    actionDescription = `Hyperlinks containing "${searchText}"`;
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Doc *${documentId}* hyperlinks removed successfully! ✅\n\n🔗 ${actionDescription} removed: ${result.removedCount}\n\nRemoved links:\n${linksList}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to remove hyperlinks: ${error}`), tools.removeDocHyperlinks);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to remove hyperlinks ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
