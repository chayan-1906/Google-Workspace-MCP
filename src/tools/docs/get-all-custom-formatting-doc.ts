import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

interface FormattingInfo {
    textStyles: any[];
    paragraphStyles: any[];
    lists: any[];
    namedStyles: any;
    summary: {
        totalElements: number;
        textStylesCount: number;
        paragraphStylesCount: number;
        listsCount: number;
    };
}

const extractFormattingFromContent = (content: any[], startIndex: number = 0): FormattingInfo => {
    const textStyles: any[] = [];
    const paragraphStyles: any[] = [];
    const lists: any[] = [];
    let currentIndex = startIndex;

    for (const element of content) {
        if (element.paragraph) {
            const para = element.paragraph;

            if (para.paragraphStyle) {
                paragraphStyles.push({
                    startIndex: element.startIndex,
                    endIndex: element.endIndex,
                    style: para.paragraphStyle,
                });
            }

            for (const elem of para.elements || []) {
                if (elem.textRun) {
                    const textRun = elem.textRun;
                    if (textRun.textStyle && Object.keys(textRun.textStyle).length > 0) {
                        textStyles.push({
                            startIndex: elem.startIndex,
                            endIndex: elem.endIndex,
                            content: textRun.content,
                            style: textRun.textStyle,
                        });
                    }
                }
            }

            if (para.bullet) {
                lists.push({
                    startIndex: element.startIndex,
                    endIndex: element.endIndex,
                    listId: para.bullet.listId,
                    nestingLevel: para.bullet.nestingLevel,
                });
            }
        }

        if (element.table) {
            for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                    const cellFormatting = extractFormattingFromContent(cell.content || [], currentIndex);
                    textStyles.push(...cellFormatting.textStyles);
                    paragraphStyles.push(...cellFormatting.paragraphStyles);
                    lists.push(...cellFormatting.lists);
                }
            }
        }

        if (element.tableOfContents) {
            const tocFormatting = extractFormattingFromContent(element.tableOfContents.content || [], currentIndex);
            textStyles.push(...tocFormatting.textStyles);
            paragraphStyles.push(...tocFormatting.paragraphStyles);
            lists.push(...tocFormatting.lists);
        }

        currentIndex = element.endIndex || currentIndex;
    }

    return {
        textStyles,
        paragraphStyles,
        lists,
        namedStyles: {},
        summary: {
            totalElements: content.length,
            textStylesCount: textStyles.length,
            paragraphStylesCount: paragraphStyles.length,
            listsCount: lists.length,
        },
    };
}

const formatFormattingReport = (formattingInfo: FormattingInfo, documentId: string): string => {
    let report = `# Formatting Report for Document: ${documentId}\n\n`;

    report += `## Summary\n`;
    report += `- Total Elements: ${formattingInfo.summary.totalElements}\n`;
    report += `- Text Styles Found: ${formattingInfo.summary.textStylesCount}\n`;
    report += `- Paragraph Styles Found: ${formattingInfo.summary.paragraphStylesCount}\n`;
    report += `- Lists Found: ${formattingInfo.summary.listsCount}\n\n`;

    if (formattingInfo.textStyles.length > 0) {
        report += `## Text Styles (${formattingInfo.textStyles.length})\n`;
        formattingInfo.textStyles.slice(0, 50).forEach((style, idx) => {
            report += `\n### Text Style ${idx + 1} (Index: ${style.startIndex}-${style.endIndex})\n`;
            report += `**Content Preview:** "${style.content?.substring(0, 50).trim()}${style.content?.length > 50 ? '...' : ''}"\n`;

            const styleProps: string[] = [];
            if (style.style.bold) styleProps.push('**Bold**');
            if (style.style.italic) styleProps.push('*Italic*');
            if (style.style.underline) styleProps.push('Underline');
            if (style.style.strikethrough) styleProps.push('~~Strikethrough~~');
            if (style.style.fontSize) styleProps.push(`Font Size: ${style.style.fontSize.magnitude}${style.style.fontSize.unit}`);
            if (style.style.weightedFontFamily) styleProps.push(`Font: ${style.style.weightedFontFamily.fontFamily}`);
            if (style.style.foregroundColor) {
                const rgb = style.style.foregroundColor.color?.rgbColor;
                if (rgb) styleProps.push(`Color: RGB(${rgb.red}, ${rgb.green}, ${rgb.blue})`);
            }
            if (style.style.backgroundColor) {
                const rgb = style.style.backgroundColor.color?.rgbColor;
                if (rgb) styleProps.push(`Background: RGB(${rgb.red}, ${rgb.green}, ${rgb.blue})`);
            }
            if (style.style.link) styleProps.push(`Link: ${style.style.link.url}`);

            report += `**Styles Applied:** ${styleProps.join(', ') || 'Default'}\n`;
        });

        if (formattingInfo.textStyles.length > 50) {
            report += `\n*... and ${formattingInfo.textStyles.length - 50} more text styles*\n`;
        }
    }

    if (formattingInfo.paragraphStyles.length > 0) {
        report += `\n## Paragraph Styles (${formattingInfo.paragraphStyles.length})\n`;
        formattingInfo.paragraphStyles.slice(0, 30).forEach((style, idx) => {
            report += `\n### Paragraph ${idx + 1} (Index: ${style.startIndex}-${style.endIndex})\n`;

            const paraProps: string[] = [];
            if (style.style.alignment) paraProps.push(`Alignment: ${style.style.alignment}`);
            if (style.style.lineSpacing) paraProps.push(`Line Spacing: ${style.style.lineSpacing}%`);
            if (style.style.direction) paraProps.push(`Direction: ${style.style.direction}`);
            if (style.style.spaceAbove) paraProps.push(`Space Above: ${style.style.spaceAbove.magnitude}${style.style.spaceAbove.unit}`);
            if (style.style.spaceBelow) paraProps.push(`Space Below: ${style.style.spaceBelow.magnitude}${style.style.spaceBelow.unit}`);
            if (style.style.indentStart) paraProps.push(`Indent Start: ${style.style.indentStart.magnitude}${style.style.indentStart.unit}`);
            if (style.style.indentEnd) paraProps.push(`Indent End: ${style.style.indentEnd.magnitude}${style.style.indentEnd.unit}`);
            if (style.style.indentFirstLine) paraProps.push(`First Line Indent: ${style.style.indentFirstLine.magnitude}${style.style.indentFirstLine.unit}`);
            if (style.style.namedStyleType) paraProps.push(`Named Style: ${style.style.namedStyleType}`);

            report += `**Properties:** ${paraProps.join(', ') || 'Default'}\n`;
        });

        if (formattingInfo.paragraphStyles.length > 30) {
            report += `\n*... and ${formattingInfo.paragraphStyles.length - 30} more paragraph styles*\n`;
        }
    }

    if (formattingInfo.lists.length > 0) {
        report += `\n## Lists (${formattingInfo.lists.length})\n`;
        const listGroups = formattingInfo.lists.reduce((acc: any, list) => {
            const key = list.listId;
            if (!acc[key]) acc[key] = [];
            acc[key].push(list);
            return acc;
        }, {});

        Object.entries(listGroups).forEach(([listId, items]: [string, any]) => {
            report += `\n### List ID: ${listId}\n`;
            report += `**Items:** ${items.length}\n`;
            report += `**Nesting Levels:** ${[...new Set(items.map((i: any) => i.nestingLevel))].join(', ')}\n`;
        });
    }

    return report;
}

const getAllCustomFormattingDoc = async (documentId: string, auth: Auth.OAuth2Client) => {
    const docs = GoogleApiClientFactory.createDocsClient(auth);

    const res = await docs.documents.get({documentId});
    const content = res.data.body?.content || [];
    const namedStyles = res.data.namedStyles;

    const formattingInfo = extractFormattingFromContent(content);
    formattingInfo.namedStyles = namedStyles;

    return formatFormattingReport(formattingInfo, documentId);
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.getAllCustomFormattingDoc,
        'Retrieves all custom formatting information from a Google Docs document, including text styles, paragraph styles, lists, and formatting details',
        {
            documentId: z.string().describe('The ID of the Google Doc to analyze for formatting'),
        },
        async ({documentId}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                const report = await getAllCustomFormattingDoc(documentId, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: report,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to get document formatting: ${error}`), tools.getAllCustomFormattingDoc);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get document formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
