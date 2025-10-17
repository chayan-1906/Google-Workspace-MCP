import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {printInConsole} from "mcp-utils/utils";
import {transport} from "../server";
import {getOAuthClientForUser} from "../services/OAuth";

import {registerTool as myGoogleAccount} from '../tools/profile/my-google-account';

import {registerTool as getDriveFolderIdsByName} from '../tools/drive/get-drive-folder-ids-by-name';
import {registerTool as getDriveFolderContentById} from '../tools/drive/get-drive-folder-content-by-id';
import {registerTool as createDriveFolder} from '../tools/drive/create-drive-folder';
import {registerTool as copyDriveFolder} from '../tools/drive/copy-drive-folder';
import {registerTool as moveDriveFolder} from '../tools/drive/move-drive-folder';
import {registerTool as deleteDriveFolder} from '../tools/drive/delete-drive-folder';
import {registerTool as getDriveStorageQuota} from '../tools/drive/get-drive-storage-quota';
import {registerTool as getDriveSharedWithMe} from '../tools/drive/getDriveSharedWithMe';

import {registerTool as getDriveFileMetadata} from '../tools/drive/get-drive-file-metadata';
import {registerTool as getDriveFilePermissions} from '../tools/drive/get-drive-file-permissions';
import {registerTool as updateDriveFilePermissions} from '../tools/drive/update-drive-file-permissions';
import {registerTool as copyDriveFile} from '../tools/drive/copy-drive-file';
import {registerTool as moveDriveFile} from '../tools/drive/move-drive-file';
import {registerTool as deleteDriveFile} from '../tools/drive/delete-drive-file';
import {registerTool as searchDriveFiles} from '../tools/drive/search-drive-files';
import {registerTool as removeDriveFileAccess} from '../tools/drive/remove-drive-file-access';
import {registerTool as setDriveLinkPermission} from '../tools/drive/set-drive-link-permission';
import {registerTool as duplicateDriveFile} from '../tools/drive/duplicate-drive-file';

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
import {registerTool as sort} from '../tools/sheets/sort-sheet';
import {registerTool as filter} from '../tools/sheets/filter-sheet';
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
import {registerTool as deleteTextRange} from '../tools/docs/delete-text-range';
import {registerTool as getParagraphRanges} from '../tools/docs/get-paragraph-ranges';
import {registerTool as insertDocHyperlink} from '../tools/docs/insert-doc-hyperlink';
import {registerTool as removeDocHyperlinks} from '../tools/docs/remove-doc-hyperlinks';
import {registerTool as exportDoc} from '../tools/docs/export-doc';
import {registerTool as applyTextStyle} from '../tools/docs/apply-text-style';
import {registerTool as applyParagraphStyle} from '../tools/docs/apply-paragraph-style';
import {registerTool as setListStyle} from '../tools/docs/set-list-style';
import {registerTool as removeAllFormattingDoc} from '../tools/docs/remove-all-formatting-doc';
import {registerTool as getAllCustomFormattingDoc} from '../tools/docs/get-all-custom-formatting-doc';
import {registerTool as insertTable} from '../tools/docs/insert-table';
import {registerTool as updateTable} from '../tools/docs/update-table';
import {registerTool as deleteTable} from '../tools/docs/delete-table';

async function setupMcpTools(server: McpServer) {
    const start = Date.now();

    myGoogleAccount(server);

    getDriveFolderIdsByName(server, getOAuthClientForUser);
    getDriveFolderContentById(server, getOAuthClientForUser);
    createDriveFolder(server, getOAuthClientForUser);
    copyDriveFolder(server, getOAuthClientForUser);
    moveDriveFolder(server, getOAuthClientForUser);
    deleteDriveFolder(server, getOAuthClientForUser);
    getDriveStorageQuota(server, getOAuthClientForUser);
    getDriveSharedWithMe(server, getOAuthClientForUser);

    getDriveFileMetadata(server, getOAuthClientForUser);
    getDriveFilePermissions(server, getOAuthClientForUser);
    updateDriveFilePermissions(server, getOAuthClientForUser);
    copyDriveFile(server, getOAuthClientForUser);
    moveDriveFile(server, getOAuthClientForUser);
    deleteDriveFile(server, getOAuthClientForUser);
    searchDriveFiles(server, getOAuthClientForUser);
    removeDriveFileAccess(server, getOAuthClientForUser);
    setDriveLinkPermission(server, getOAuthClientForUser);
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
    deleteTextRange(server, getOAuthClientForUser);
    getParagraphRanges(server, getOAuthClientForUser);
    insertDocHyperlink(server, getOAuthClientForUser);
    removeDocHyperlinks(server, getOAuthClientForUser);
    exportDoc(server, getOAuthClientForUser);
    applyTextStyle(server, getOAuthClientForUser);
    applyParagraphStyle(server, getOAuthClientForUser);
    setListStyle(server, getOAuthClientForUser);
    removeAllFormattingDoc(server, getOAuthClientForUser);
    getAllCustomFormattingDoc(server, getOAuthClientForUser);
    insertTable(server, getOAuthClientForUser);
    updateTable(server, getOAuthClientForUser);
    deleteTable(server, getOAuthClientForUser);

    await printInConsole(transport, `All tools loaded in ${Date.now() - start}ms`);
}

export {setupMcpTools};
