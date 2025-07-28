import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {getOAuthClientForUser} from "../services/OAuth";

import {registerTool as myGoogleAccount} from '../tools/profile/my-google-account';

import {registerTool as getDriveFolderIdsByName} from '../tools/drive/get-drive-folder-ids-by-name';
import {registerTool as getDriveFolderContentById} from '../tools/drive/get-drive-folder-content-by-id';
import {registerTool as createDriveFolder} from '../tools/drive/createDriveFolder';
import {registerTool as copyDriveFolder} from '../tools/drive/copyDriveFolder';
import {registerTool as moveDriveFolder} from '../tools/drive/moveDriveFolder';
import {registerTool as getDriveStorageQuota} from '../tools/drive/getDriveStorageQuota';
import {registerTool as getDriveSharedWithMe} from '../tools/drive/getDriveSharedWithMe';

import {registerTool as getDriveFileMetadata} from '../tools/drive/getDriveFileMetadata';
import {registerTool as getDriveFilePermissions} from '../tools/drive/getDriveFilePermissions';
import {registerTool as updateDriveFilePermissions} from '../tools/drive/updateDriveFilePermissions';
import {registerTool as copyDriveFile} from '../tools/drive/copyDriveFile';
import {registerTool as moveDriveFile} from '../tools/drive/moveDriveFile';
import {registerTool as searchDriveFiles} from '../tools/drive/searchDriveFiles';
import {registerTool as removeDriveFileAccess} from '../tools/drive/removeDriveFileAccess';
import {registerTool as setDriveLinkPermission} from '../tools/drive/setDriveLinkPermission';
import {registerTool as deleteDriveFile} from '../tools/drive/deleteDriveFile';
import {registerTool as duplicateDriveFile} from '../tools/drive/duplicateDriveFile';

import {registerTool as getSheetIdsByName} from '../tools/drive/get-sheet-ids-by-name';
import {registerTool as createSpreadsheet} from '../tools/drive/create-spreadsheet';
import {registerTool as deleteSpreadsheet} from '../tools/drive/delete-spreadsheet';
import {registerTool as renameSpreadsheet} from '../tools/drive/rename-spreadsheet';
import {registerTool as shareSpreadsheet} from '../tools/drive/share-spreadsheet';
import {registerTool as unshareSpreadsheet} from '../tools/drive/unshare-spreadsheet';
import {registerTool as getDocIdsByName} from '../tools/drive/get-doc-ids-by-name';
import {registerTool as getDocMetadata} from '../tools/drive/get-doc-metadata';
import {registerTool as createDoc} from '../tools/drive/create-doc';
import {registerTool as deleteDoc} from '../tools/drive/delete-doc';
import {registerTool as renameDoc} from '../tools/drive/rename-doc';

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

    getDriveFolderIdsByName(server, getOAuthClientForUser);
    getDriveFolderContentById(server, getOAuthClientForUser);
    createDriveFolder(server, getOAuthClientForUser);
    copyDriveFolder(server, getOAuthClientForUser);
    moveDriveFolder(server, getOAuthClientForUser);
    getDriveStorageQuota(server, getOAuthClientForUser);
    getDriveSharedWithMe(server, getOAuthClientForUser);

    getDriveFileMetadata(server, getOAuthClientForUser);
    getDriveFilePermissions(server, getOAuthClientForUser);
    updateDriveFilePermissions(server, getOAuthClientForUser);
    copyDriveFile(server, getOAuthClientForUser);
    moveDriveFile(server, getOAuthClientForUser);
    searchDriveFiles(server, getOAuthClientForUser);
    removeDriveFileAccess(server, getOAuthClientForUser);
    setDriveLinkPermission(server, getOAuthClientForUser);
    deleteDriveFile(server, getOAuthClientForUser);
    duplicateDriveFile(server, getOAuthClientForUser);

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
