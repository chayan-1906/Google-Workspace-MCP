import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {z} from "zod";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";

// TODO: Fix - use findTextIndices
const flattenTextWithParagraphBreaks = (content: any[]): string => {
    let text = "";

    for (const element of content) {
        // If it’s a normal paragraph, collect its textRuns
        if (element.paragraph) {
            for (const elem of element.paragraph.elements || []) {
                if (elem.textRun?.content) {
                    text += elem.textRun.content;
                }
            }
            // Append a "\n" to mark the end of this paragraph
            text += "\n";
        }

        // If it’s a table, recurse into each cell
        if (element.table) {
            for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                    text += flattenTextWithParagraphBreaks(cell.content || []);
                }
            }
        }

        // If it’s a table of contents, recurse
        if (element.tableOfContents) {
            text += flattenTextWithParagraphBreaks(element.tableOfContents.content || []);
        }
    }

    return text;
}

const deleteParagraphByNumber = async (documentId: string, paragraphNumber: number, auth: Auth.OAuth2Client): Promise<{ startIndex: number; endIndex: number }> => {
    const {google} = await import("googleapis");
    const docs = google.docs({version: "v1", auth});
    const doc = await docs.documents.get({documentId});
    const body = doc.data.body?.content || [];

    let count = 0;
    for (const element of body) {
        if (element.paragraph) {
            // Check if paragraph has non-whitespace text
            const paraText = (element.paragraph.elements || [])
                .map((e: any) => e.textRun?.content || "")
                .join("")
                .trim();
            if (paraText.length > 0 && typeof element.startIndex === "number" && typeof element.endIndex === "number") {
                count += 1;
                if (count === paragraphNumber) {
                    // For the first paragraph, startIndex 0 is section break; use 1 instead
                    const safeStart = paragraphNumber === 1 ? 1 : element.startIndex;
                    return {startIndex: safeStart, endIndex: element.endIndex};
                }
            }
        }
    }

    throw new Error(`Paragraph number ${paragraphNumber} not found`);
}

const deleteTextRange = async (documentId: string, startIndex: number, endIndex: number, auth: Auth.OAuth2Client, paragraphNumber?: number) => {
    const {google} = await import('googleapis');
    const docs = google.docs({version: 'v1', auth});

    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    deleteContentRange: {
                        range: {startIndex, endIndex},
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.deleteTextRange,
        'Deletes text from a Google Docs document between two indices',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            startIndex: z
                .number()
                .nonnegative()
                .optional()
                .describe("Start index of the range to delete (ignored if paragraphNumber is provided)"),
            endIndex: z
                .number()
                .nonnegative()
                .optional()
                .describe("End index of the range to delete (ignored if paragraphNumber is provided)"),
            paragraphNumber: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("If provided, deletes the Nth non-empty paragraph"),
        },
        async ({documentId, startIndex = 0, endIndex = 0, paragraphNumber}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                let safeStart: number, safeEnd: number;
                if (paragraphNumber) {
                    const indices = await deleteParagraphByNumber(documentId, paragraphNumber, oauth2Client);
                    safeStart = indices.startIndex || 0;
                    safeEnd = indices.endIndex || 0;
                } else {
                    // If startIndex = 0, treat as delete first paragraph
                    if (startIndex === 0) {
                        const {startIndex: p1Start, endIndex: p1End} = await deleteParagraphByNumber(documentId, 1, oauth2Client);
                        safeStart = p1Start;
                        safeEnd = p1End;
                    } else {
                        safeStart = startIndex;
                        safeEnd = endIndex;
                    }
                }

                if (safeStart >= safeEnd) {
                    throw new Error(`Invalid range: startIndex (${safeStart}) must be < endIndex (${safeEnd})`);
                }

                await deleteTextRange(documentId, safeStart, safeEnd, oauth2Client);

                const message = paragraphNumber
                    ? `Paragraph ${paragraphNumber} deleted ✅`
                    : startIndex === 0
                        ? `First paragraph deleted ✅`
                        : `Text deleted from index ${safeStart} to ${safeEnd} ✅`;

                return {
                    content: [
                        {
                            type: 'text',
                            text: message,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to delete text range: ${error}`), 'delete-text-range');
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
