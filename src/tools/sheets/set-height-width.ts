import {z} from "zod";
import type {Auth} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {tools} from "../../utils/constants";
import {getOAuth2ClientFromEmail} from "../../services/OAuth";
import {GoogleApiClientFactory} from "../../services/GoogleApiClients";

const setHeightWidth = async (spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number, dimension: 'ROWS' | 'COLUMNS', pixelSize: number, auth: Auth.OAuth2Client) => {
    const sheets = GoogleApiClientFactory.createSheetsClient(auth);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId,
                            dimension,
                            startIndex,
                            endIndex,
                        },
                        properties: {
                            pixelSize,
                        },
                        fields: "pixelSize",
                    },
                },
            ],
        },
    });
}

export const registerTool = (server: McpServer, getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>) => {
    server.tool(
        tools.setHeightWidth,
        'Sets row height or column width in a Google Spreadsheet',
        {
            spreadsheetId: z.string().describe('The ID of the Google Spreadsheet'),
            sheetId: z.number().describe('The numeric ID of the sheet tab'),
            startIndex: z.number().describe('Start index (inclusive)'),
            endIndex: z.number().describe('End index (exclusive)'),
            dimension: z.enum(['ROWS', 'COLUMNS']).describe('Target dimension'),
            pixelSize: z.number().describe('Height or width in pixels'),
        },
        async ({spreadsheetId, sheetId, startIndex, endIndex, dimension, pixelSize}) => {
            const {oauth2Client, response} = await getOAuth2ClientFromEmail(getOAuthClientForUser);
            if (!oauth2Client) return response;

            try {
                await setHeightWidth(spreadsheetId, sheetId, startIndex, endIndex, dimension, pixelSize, oauth2Client);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Sheet *${spreadsheetId}* dimensions updated successfully! ✅`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to set height width: ${error}`), tools.setHeightWidth);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set height width ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
