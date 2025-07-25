import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const customCellFormatting = async (spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number, formatting: any, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    const formatRequest: any = {
        repeatCell: {
            range: {
                sheetId,
            },
            cell: {
                userEnteredFormat: {},
            },
            fields: 'userEnteredFormat('
        }
    };

    formatRequest.repeatCell.range = {
        sheetId,
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
    };

    const cellFormat = formatRequest.repeatCell.cell.userEnteredFormat;
    const fields = [];

    // Text formatting
    if (formatting.bold !== undefined || formatting.italic !== undefined || formatting.fontSize || formatting.fontFamily || formatting.strikethrough !== undefined || formatting.underline !== undefined) {
        cellFormat.textFormat = {};
        if (formatting.bold !== undefined) {
            cellFormat.textFormat.bold = formatting.bold;
            fields.push('textFormat.bold');
        }
        if (formatting.italic !== undefined) {
            cellFormat.textFormat.italic = formatting.italic;
            fields.push('textFormat.italic');
        }
        if (formatting.fontSize) {
            cellFormat.textFormat.fontSize = formatting.fontSize;
            fields.push('textFormat.fontSize');
        }
        if (formatting.fontFamily) {
            cellFormat.textFormat.fontFamily = formatting.fontFamily;
            fields.push('textFormat.fontFamily');
        }
        if (formatting.strikethrough !== undefined) {
            cellFormat.textFormat.strikethrough = formatting.strikethrough;
            fields.push('textFormat.strikethrough');
        }
        if (formatting.underline !== undefined) {
            cellFormat.textFormat.underline = formatting.underline;
            fields.push('textFormat.underline');
        }
    }

    // Foreground color
    if (formatting.foregroundColor) {
        if (!cellFormat.textFormat) cellFormat.textFormat = {};
        cellFormat.textFormat.foregroundColor = formatting.foregroundColor;
        fields.push('textFormat.foregroundColor');
    }

    // Background color
    if (formatting.backgroundColor) {
        cellFormat.backgroundColor = formatting.backgroundColor;
        fields.push('backgroundColor');
    }

    // Alignment
    if (formatting.horizontalAlignment || formatting.verticalAlignment) {
        if (formatting.horizontalAlignment) {
            cellFormat.horizontalAlignment = formatting.horizontalAlignment;
            fields.push('horizontalAlignment');
        }
        if (formatting.verticalAlignment) {
            cellFormat.verticalAlignment = formatting.verticalAlignment;
            fields.push('verticalAlignment');
        }
    }

    // Text wrapping
    if (formatting.wrapStrategy) {
        cellFormat.wrapStrategy = formatting.wrapStrategy;
        fields.push('wrapStrategy');
    }

    // Text rotation
    if (formatting.textRotation !== undefined) {
        if (typeof formatting.textRotation === 'number') {
            cellFormat.textRotation = {angle: formatting.textRotation};
        } else {
            cellFormat.textRotation = formatting.textRotation;
        }
        fields.push('textRotation');
    }

    // Borders
    if (formatting.borders) {
        cellFormat.borders = formatting.borders;
        fields.push('borders');
    }

    // Number format
    if (formatting.numberFormat) {
        cellFormat.numberFormat = formatting.numberFormat;
        fields.push('numberFormat');
    }

    formatRequest.repeatCell.fields = 'userEnteredFormat(' + fields.join(',') + ')';

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [formatRequest],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.customCellFormatting,
        'Applies custom formatting to a specified cell range in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab'),
            startRowIndex: z.number().describe('Start row index (inclusive)'),
            endRowIndex: z.number().describe('End row index (exclusive)'),
            startColumnIndex: z.number().describe('Start column index (inclusive)'),
            endColumnIndex: z.number().describe('End column index (exclusive)'),
            formatting: z.object({
                bold: z.boolean().optional().describe('Make text bold'),
                italic: z.boolean().optional().describe('Make text italic'),
                strikethrough: z.boolean().optional().describe('Apply strikethrough'),
                underline: z.boolean().optional().describe('Apply underline'),
                fontSize: z.number().optional().describe('Font size in points'),
                fontFamily: z.string().optional().describe('Font family name'),
                foregroundColor: z.object({
                    red: z.number().min(0).max(1),
                    green: z.number().min(0).max(1),
                    blue: z.number().min(0).max(1),
                    alpha: z.number().min(0).max(1).optional()
                }).optional().describe('Text color (RGB values 0-1)'),
                backgroundColor: z.object({
                    red: z.number().min(0).max(1),
                    green: z.number().min(0).max(1),
                    blue: z.number().min(0).max(1),
                    alpha: z.number().min(0).max(1).optional()
                }).optional().describe('Background color (RGB values 0-1)'),
                horizontalAlignment: z.enum(['LEFT', 'CENTER', 'RIGHT']).optional().describe('Horizontal text alignment'),
                verticalAlignment: z.enum(['TOP', 'MIDDLE', 'BOTTOM']).optional().describe('Vertical text alignment'),
                wrapStrategy: z.enum(['OVERFLOW_CELL', 'LEGACY_WRAP', 'CLIP', 'WRAP']).optional().describe('Text wrapping strategy'),
                textRotation: z.union([
                    z.number().min(-90).max(90).describe('Rotation angle in degrees'),
                    z.object({
                        angle: z.number().min(-90).max(90),
                        vertical: z.boolean().optional()
                    })
                ]).optional().describe('Text rotation configuration'),
                borders: z.object({
                    top: z.object({
                        style: z.enum(['NONE', 'DOTTED', 'DASHED', 'SOLID', 'SOLID_MEDIUM', 'SOLID_THICK', 'DOUBLE']),
                        color: z.object({
                            red: z.number().min(0).max(1),
                            green: z.number().min(0).max(1),
                            blue: z.number().min(0).max(1)
                        }).optional()
                    }).optional(),
                    bottom: z.object({
                        style: z.enum(['NONE', 'DOTTED', 'DASHED', 'SOLID', 'SOLID_MEDIUM', 'SOLID_THICK', 'DOUBLE']),
                        color: z.object({
                            red: z.number().min(0).max(1),
                            green: z.number().min(0).max(1),
                            blue: z.number().min(0).max(1)
                        }).optional()
                    }).optional(),
                    left: z.object({
                        style: z.enum(['NONE', 'DOTTED', 'DASHED', 'SOLID', 'SOLID_MEDIUM', 'SOLID_THICK', 'DOUBLE']),
                        color: z.object({
                            red: z.number().min(0).max(1),
                            green: z.number().min(0).max(1),
                            blue: z.number().min(0).max(1)
                        }).optional()
                    }).optional(),
                    right: z.object({
                        style: z.enum(['NONE', 'DOTTED', 'DASHED', 'SOLID', 'SOLID_MEDIUM', 'SOLID_THICK', 'DOUBLE']),
                        color: z.object({
                            red: z.number().min(0).max(1),
                            green: z.number().min(0).max(1),
                            blue: z.number().min(0).max(1)
                        }).optional()
                    }).optional()
                }).optional().describe('Cell borders configuration'),
                numberFormat: z.object({
                    type: z.enum(['TEXT', 'NUMBER', 'PERCENT', 'CURRENCY', 'DATE', 'TIME', 'DATE_TIME', 'SCIENTIFIC']),
                    pattern: z.string().optional()
                }).optional().describe('Number format configuration')
            }).describe('Formatting options to apply'),
        },
        async ({spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, formatting}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await customCellFormatting(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, formatting, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* cell formatting applied successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add custom cell formatting: ${error}`), tools.customCellFormatting);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add custom cell formatting ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
