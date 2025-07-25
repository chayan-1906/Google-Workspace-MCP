import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const addChart = async (spreadsheetId: string, sheetId: number, chartTitle: string, chartType: 'COLUMN' | 'BAR' | 'LINE' | 'PIE' | 'AREA' | 'SCATTER' | 'STEPPED_AREA', startRowIndex: number, endRowIndex: number, xAxisColumnIndex: number, yAxisColumnIndices: number[], anchorRowIndex: number, anchorColumnIndex: number, widthPixels: number, heightPixels: number, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    const chartSpec: any = {title: chartTitle};

    if (chartType === 'PIE') {
        chartSpec.pieChart = {
            legendPosition: 'RIGHT_LEGEND',
            domain: {
                sourceRange: {
                    sources: [
                        {
                            sheetId,
                            startRowIndex,
                            endRowIndex,
                            startColumnIndex: xAxisColumnIndex,
                            endColumnIndex: xAxisColumnIndex + 1,
                        },
                    ],
                },
            },
            series: {
                sourceRange: {
                    sources: [
                        {
                            sheetId,
                            startRowIndex,
                            endRowIndex,
                            startColumnIndex: yAxisColumnIndices[0],
                            endColumnIndex: yAxisColumnIndices[0] + 1,
                        },
                    ],
                },
            },
        };
    } else {
        chartSpec.basicChart = {
            chartType,
            legendPosition: 'RIGHT_LEGEND',
            domains: [
                {
                    domain: {
                        sourceRange: {
                            sources: [
                                {
                                    sheetId,
                                    startRowIndex,
                                    endRowIndex,
                                    startColumnIndex: xAxisColumnIndex,
                                    endColumnIndex: xAxisColumnIndex + 1,
                                },
                            ],
                        },
                    },
                },
            ],
            series: yAxisColumnIndices.map((colIndex) => ({
                series: {
                    sourceRange: {
                        sources: [
                            {
                                sheetId,
                                startRowIndex,
                                endRowIndex,
                                startColumnIndex: colIndex,
                                endColumnIndex: colIndex + 1,
                            },
                        ],
                    },
                },
            })),
        };
    }

    const requests = [
        {
            addChart: {
                chart: {
                    spec: chartSpec,
                    position: {
                        overlayPosition: {
                            anchorCell: {
                                sheetId,
                                rowIndex: anchorRowIndex,
                                columnIndex: anchorColumnIndex,
                            },
                            offsetXPixels: 0,
                            offsetYPixels: 0,
                            widthPixels,
                            heightPixels,
                        },
                    },
                },
            },
        },
    ];

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests,
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.addChart,
        'Adds a chart to the specified sheet in Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('Numeric ID of the sheet tab to insert the chart in'),
            chartTitle: z.string().describe('Chart title'),
            chartType: z.enum(['COLUMN', 'BAR', 'LINE', 'AREA', 'SCATTER', 'STEPPED_AREA', 'PIE']).describe('Type of the chart to create'),
            startRowIndex: z.number().describe('The starting row index (0-based) of the data range to be used for the chart'),
            endRowIndex: z.number().describe('The ending row index (0-based) of the data range to be used for the chart (Exclusive)'),
            xAxisColumnIndex: z.number().describe('Index of the column to use as X-axis'),
            yAxisColumnIndices: z.array(z.number()).describe('Array of column indices to use as Y-axis'),
            anchorRowIndex: z.number().describe('Row index to place the chart'),
            anchorColumnIndex: z.number().describe('Column index to place the chart'),
            widthPixels: z.number().describe('The width of the chart in pixels. Determines how wide the chart appears on the sheet'),
            heightPixels: z.number().describe('The height of the chart in pixels. Determines how tall the chart appears on the sheet'),
        },
        async ({spreadsheetId, sheetId, chartTitle, chartType, startRowIndex, endRowIndex, xAxisColumnIndex, yAxisColumnIndices, anchorRowIndex, anchorColumnIndex, widthPixels, heightPixels}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await addChart(spreadsheetId, sheetId, chartTitle, chartType, startRowIndex, endRowIndex, xAxisColumnIndex, yAxisColumnIndices, anchorRowIndex, anchorColumnIndex, widthPixels, heightPixels, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* chart added successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to add chart: ${error}`), tools.addChart);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to add chart ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
