import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../server";
import {printInConsole} from "../utils/printInConsole";
import {getOAuthClientForUser} from "../services/OAuth";

import {registerTool as myGoogleAccount} from '../tools/profile/my-google-account';

import {registerTool as getFolderIdsByName} from '../tools/drives/get-folder-ids-by-name';
import {registerTool as getFolderContentById} from '../tools/drives/get-folder-content-by-id';
import {registerTool as getSheetIdsByName} from '../tools/drives/get-sheet-ids-by-name';
import {registerTool as createSpreadsheet} from '../tools/drives/create-spreadsheet';
import {registerTool as deleteSpreadsheet} from '../tools/drives/delete-spreadsheet';
import {registerTool as renameSpreadsheet} from '../tools/drives/rename-spreadsheet';
import {registerTool as shareSpreadsheet} from '../tools/drives/share-spreadsheet';
import {registerTool as unshareSpreadsheet} from '../tools/drives/unshare-spreadsheet';
import {registerTool as getDocIdsByName} from '../tools/drives/get-doc-ids-by-name';
import {registerTool as getDocMetadata} from '../tools/drives/get-doc-metadata';
import {registerTool as createDoc} from '../tools/drives/create-doc';
import {registerTool as deleteDoc} from '../tools/drives/delete-doc';
import {registerTool as renameDoc} from '../tools/drives/rename-doc';

import {registerTool as appendSheetTabRow} from '../tools/sheets/append-sheet-tab-row';
import {registerTool as deleteRow} from '../tools/sheets/delete-row';
import {registerTool as clearRanges} from '../tools/sheets/clear-ranges';
import {registerTool as updateRanges} from '../tools/sheets/update-ranges';
import {registerTool as getSheetTabContent} from '../tools/sheets/get-sheet-tab-content';
import {registerTool as addSheetTab} from '../tools/sheets/add-sheet-tab';
import {registerTool as renameSheetTab} from '../tools/sheets/rename-sheet-tab';
import {registerTool as deleteSheetTab} from '../tools/sheets/delete-sheet-tab';
import {registerTool as addSheetTabContent} from '../tools/sheets/add-sheet-tab-content';
import {registerTool as updateSheetTabContent} from '../tools/sheets/update-sheet-tab-content';
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
import {registerTool as clearAllCustomCellFormattingSheet} from '../tools/sheets/clear-all-custom-cell-formatting-sheet';
import {registerTool as duplicateSheetTab} from '../tools/sheets/duplicate-sheet-tab';
import {registerTool as mergeCells} from '../tools/sheets/merge-cells';
import {registerTool as unmergeCells} from '../tools/sheets/unmerge-cells';
import {registerTool as setHeightWidth} from '../tools/sheets/set-height-width';
import {registerTool as protectCells} from '../tools/sheets/protect-cells';
import {registerTool as insertLinkSheet} from '../tools/sheets/insert-link-sheet';

import {registerTool as appendDocText} from '../tools/docs/append-doc-text';
import {registerTool as getDocContent} from '../tools/docs/get-doc-content';
import {registerTool as findTextIndices} from '../tools/docs/find-text-indices';
import {registerTool as insertTextAtPosition} from '../tools/docs/insert-text-at-position';
import {registerTool as findAndReplaceTextDoc} from '../tools/docs/find-and-replace-text-doc';
import {registerTool as deleteTextRange} from '../tools/docs/delete-text-range';
import {registerTool as insertLinkDoc} from '../tools/docs/insert-link-doc';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    myGoogleAccount(server);

    getFolderIdsByName(server, getOAuthClientForUser);
    getFolderContentById(server, getOAuthClientForUser);
    getSheetIdsByName(server, getOAuthClientForUser);
    createSpreadsheet(server, getOAuthClientForUser);
    deleteSpreadsheet(server, getOAuthClientForUser);
    renameSpreadsheet(server, getOAuthClientForUser);
    shareSpreadsheet(server, getOAuthClientForUser);
    unshareSpreadsheet(server, getOAuthClientForUser);
    getDocIdsByName(server, getOAuthClientForUser);
    getDocMetadata(server, getOAuthClientForUser);
    createDoc(server, getOAuthClientForUser);
    deleteDoc(server, getOAuthClientForUser);
    renameDoc(server, getOAuthClientForUser);

    appendSheetTabRow(server, getOAuthClientForUser);
    deleteRow(server, getOAuthClientForUser);
    clearRanges(server, getOAuthClientForUser);
    updateRanges(server, getOAuthClientForUser);
    getSheetTabContent(server, getOAuthClientForUser);
    addSheetTab(server, getOAuthClientForUser);
    renameSheetTab(server, getOAuthClientForUser);
    deleteSheetTab(server, getOAuthClientForUser);
    addSheetTabContent(server, getOAuthClientForUser);
    updateSheetTabContent(server, getOAuthClientForUser);
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
    clearAllCustomCellFormattingSheet(server, getOAuthClientForUser);
    duplicateSheetTab(server, getOAuthClientForUser);
    mergeCells(server, getOAuthClientForUser);
    unmergeCells(server, getOAuthClientForUser);
    setHeightWidth(server, getOAuthClientForUser);
    protectCells(server, getOAuthClientForUser);
    insertLinkSheet(server, getOAuthClientForUser);

    appendDocText(server, getOAuthClientForUser);
    getDocContent(server, getOAuthClientForUser);
    findTextIndices(server, getOAuthClientForUser);
    insertTextAtPosition(server, getOAuthClientForUser);
    findAndReplaceTextDoc(server, getOAuthClientForUser);
    deleteTextRange(server, getOAuthClientForUser);
    insertLinkDoc(server, getOAuthClientForUser);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
