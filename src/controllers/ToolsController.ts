import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../server";
import {printInConsole} from "../utils/printInConsole";
import {getOAuthClientForUser} from "../services/OAuth";

import {registerTool as createSpreadsheet} from '../tools/drives/create-spreadsheet';
import {registerTool as getFolderContentById} from '../tools/drives/get-folder-content-by-id';
import {registerTool as getFolderIdsByName} from '../tools/drives/get-folder-ids-by-name';
import {registerTool as getSheetIdsByName} from '../tools/drives/get-sheet-ids-by-name';
import {registerTool as renameSpreadsheet} from '../tools/drives/rename-spreadsheet';
import {registerTool as addSheet} from '../tools/sheets/add-sheet';
import {registerTool as appendRow} from '../tools/sheets/append-row';
import {registerTool as clearRanges} from '../tools/sheets/clear-ranges';
import {registerTool as getSheetContent} from '../tools/sheets/get-sheet-content';
import {registerTool as updateRanges} from '../tools/sheets/update-ranges';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    createSpreadsheet(server, getOAuthClientForUser);
    getFolderContentById(server, getOAuthClientForUser);
    getFolderIdsByName(server, getOAuthClientForUser);
    getSheetIdsByName(server, getOAuthClientForUser);
    renameSpreadsheet(server, getOAuthClientForUser);

    addSheet(server, getOAuthClientForUser);
    appendRow(server, getOAuthClientForUser);
    clearRanges(server, getOAuthClientForUser);
    getSheetContent(server, getOAuthClientForUser);
    updateRanges(server, getOAuthClientForUser);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools}
