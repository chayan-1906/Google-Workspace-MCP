import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface ParagraphBoundary {
    paragraphNumber: number;
    startIndex: number;
    endIndex: number;
    content: string;
}

const extractTextWithIndices = (content: any[], baseIndex: number = 0): { text: string; totalLength: number } => {
    let text = '';

    for (const element of content) {
        if (element.paragraph) {
            for (const elem of element.paragraph.elements || []) {
                if (elem.textRun?.content) {
                    text += elem.textRun.content;
                }
            }
        }

        if (element.table) {
            for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                    const cellResult = extractTextWithIndices(cell.content || [], 0);
                    text += cellResult.text;
                }
            }
        }

        if (element.tableOfContents) {
            const tocResult = extractTextWithIndices(element.tableOfContents.content || [], 0);
            text += tocResult.text;
        }
    }

    return {text, totalLength: text.length};
}

const getParagraphBoundaries = (fullText: string): ParagraphBoundary[] => {
    const paragraphs: ParagraphBoundary[] = [];
    const lines = fullText.split('\n');
    let currentIndex = 0;
    let paragraphNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStartIndex = currentIndex;
        const lineEndIndex = currentIndex + line.length;

        // Skip empty lines
        if (line.trim().length > 0) {
            paragraphs.push({
                paragraphNumber,
                startIndex: lineStartIndex,
                endIndex: lineEndIndex + (i < lines.length - 1 ? 1 : 0), // Include newline except for last line
                content: line.trim()
            });
            paragraphNumber++;
        }

        currentIndex = lineEndIndex + 1; // +1 for newline character
    }

    return paragraphs;
}

const getParagraphRanges = async (documentId: string, paragraphNumbers: number[], auth: Auth.OAuth2Client): Promise<{ paragraphs: ParagraphBoundary[]; ranges: { startIndex: number; endIndex: number }[] }> => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const res = await docs.documents.get({documentId});
    const content = res.data.body?.content || [];

    const {text: fullText} = extractTextWithIndices(content);
    const allParagraphs = getParagraphBoundaries(fullText);

    const requestedParagraphs = allParagraphs.filter(p => paragraphNumbers.includes(p.paragraphNumber));
    const ranges = requestedParagraphs.map(p => ({startIndex: p.startIndex, endIndex: p.endIndex}));

    return {paragraphs: requestedParagraphs, ranges};
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getParagraphRanges,
        'Identifies paragraph boundaries and returns exact ranges for deletion',
        {
            documentId: z.string().describe('The ID of the Google Docs document'),
            paragraphNumbers: z.array(z.number().min(1)).describe('Array of paragraph numbers to get ranges for (1-based)'),
        },
        async ({documentId, paragraphNumbers}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const result = await getParagraphRanges(documentId, paragraphNumbers, oauth2Client);

                const paragraphInfo = result.paragraphs.map(p =>
                    `${p.paragraphNumber}. [${p.startIndex}:${p.endIndex}] "${p.content.substring(0, 50)}${p.content.length > 50 ? '...' : ''}"`
                ).join('\n');

                const rangesJson = JSON.stringify(result.ranges);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Paragraph ranges identified:\n\n${paragraphInfo}\n\nRanges for deletion: ${rangesJson}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get paragraph ranges: ${error}`), tools.getParagraphRanges);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get paragraph ranges ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
