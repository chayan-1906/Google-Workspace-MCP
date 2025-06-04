import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../server";
import {printInConsole} from "../utils/printInConsole";
import {getOAuthClientForUser} from "../services/OAuth";

import {registerTool as myDetails} from '../tools/profile/my-details';

import {registerTool as getFolderIdsByName} from '../tools/drives/get-folder-ids-by-name';
import {registerTool as getFolderContentById} from '../tools/drives/get-folder-content-by-id';
import {registerTool as getSheetIdsByName} from '../tools/drives/get-sheet-ids-by-name';
import {registerTool as createSpreadsheet} from '../tools/drives/create-spreadsheet';
import {registerTool as renameSpreadsheet} from '../tools/drives/rename-spreadsheet';
import {registerTool as getDocIdsByName} from '../tools/drives/get-doc-ids-by-name';
import {registerTool as getDocMetadata} from '../tools/drives/get-doc-metadata';
import {registerTool as createDoc} from '../tools/drives/create-doc';
import {registerTool as deleteDoc} from '../tools/drives/delete-doc';
import {registerTool as renameDoc} from '../tools/drives/rename-doc';

import {registerTool as appendSheetRow} from '../tools/sheets/append-sheet-row';
import {registerTool as deleteRow} from '../tools/sheets/delete-row';
import {registerTool as clearRanges} from '../tools/sheets/clear-ranges';
import {registerTool as updateRanges} from '../tools/sheets/update-ranges';
import {registerTool as getSheetContent} from '../tools/sheets/get-sheet-content';
import {registerTool as addSheet} from '../tools/sheets/add-sheet';
import {registerTool as renameSheet} from '../tools/sheets/rename-sheet';
import {registerTool as deleteSheet} from '../tools/sheets/delete-sheet';
import {registerTool as addSheetContent} from '../tools/sheets/add-sheet-content';
import {registerTool as updateSheetContent} from '../tools/sheets/update-sheet-content';
import {registerTool as insertColumn} from '../tools/sheets/insert-column';
import {registerTool as deleteColumn} from '../tools/sheets/delete-column';
import {registerTool as addChart} from '../tools/sheets/add-chart';
import {registerTool as sort} from '../tools/sheets/sort';
import {registerTool as filter} from '../tools/sheets/filter';
import {registerTool as functions} from '../tools/sheets/functions';
import {registerTool as addConditionalFormatting} from '../tools/sheets/add-conditional-formatting';
import {registerTool as clearAllConditionalFormatting} from '../tools/sheets/clear-all-conditional-formatting';
import {registerTool as freezeRowsColumns} from '../tools/sheets/freeze-rows-columns';
import {registerTool as unfreezeRowsColumns} from '../tools/sheets/unfreeze-rows-columns';
import {registerTool as customCellFormatting} from '../tools/sheets/custom-cell-formatting';
import {registerTool as duplicateSheet} from '../tools/sheets/duplicate-sheet';
import {registerTool as mergeCells} from '../tools/sheets/merge-cells';
import {registerTool as unmergeCells} from '../tools/sheets/unmerge-cells';
import {registerTool as setHeightWidth} from '../tools/sheets/set-height-width';
import {registerTool as protectCells} from '../tools/sheets/protect-cells';
import {registerTool as insertLinkSheet} from '../tools/sheets/insert-link-sheet';

import {registerTool as appendDocText} from '../tools/docs/append-doc-text';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    myDetails(server);

    getFolderIdsByName(server, getOAuthClientForUser);
    getFolderContentById(server, getOAuthClientForUser);
    getSheetIdsByName(server, getOAuthClientForUser);
    createSpreadsheet(server, getOAuthClientForUser);
    renameSpreadsheet(server, getOAuthClientForUser);
    getDocIdsByName(server, getOAuthClientForUser);
    getDocMetadata(server, getOAuthClientForUser);
    createDoc(server, getOAuthClientForUser);
    deleteDoc(server, getOAuthClientForUser);
    renameDoc(server, getOAuthClientForUser);

    appendSheetRow(server, getOAuthClientForUser);
    deleteRow(server, getOAuthClientForUser);
    clearRanges(server, getOAuthClientForUser);
    updateRanges(server, getOAuthClientForUser);
    getSheetContent(server, getOAuthClientForUser);
    addSheet(server, getOAuthClientForUser);
    renameSheet(server, getOAuthClientForUser);
    deleteSheet(server, getOAuthClientForUser);
    addSheetContent(server, getOAuthClientForUser);
    updateSheetContent(server, getOAuthClientForUser);
    insertColumn(server, getOAuthClientForUser);
    deleteColumn(server, getOAuthClientForUser);
    addChart(server, getOAuthClientForUser);
    sort(server, getOAuthClientForUser);
    filter(server, getOAuthClientForUser);
    functions(server, getOAuthClientForUser);
    addConditionalFormatting(server, getOAuthClientForUser);
    clearAllConditionalFormatting(server, getOAuthClientForUser);
    freezeRowsColumns(server, getOAuthClientForUser);
    unfreezeRowsColumns(server, getOAuthClientForUser);
    customCellFormatting(server, getOAuthClientForUser);
    duplicateSheet(server, getOAuthClientForUser);
    mergeCells(server, getOAuthClientForUser);
    unmergeCells(server, getOAuthClientForUser);
    setHeightWidth(server, getOAuthClientForUser);
    protectCells(server, getOAuthClientForUser);
    insertLinkSheet(server, getOAuthClientForUser);

    appendDocText(server, getOAuthClientForUser);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools}
