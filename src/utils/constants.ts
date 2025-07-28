const tools = {
    myGoogleAccount: 'my-google-account',

    /** google drive */
    getDriveFolderIdsByName: 'get-drive-folder-ids-by-name',
    getDriveFolderContentById: 'get-drive-folder-content-by-id',
    createDriveFolder: 'create-drive-folder',
    copyDriveFolder: 'copy-drive-folder',
    moveDriveFolder: 'move-drive-folder',
    getDriveStorageQuota: 'get-drive-storage-quota',
    getDriveSharedWithMe: 'get-drive-shared-with-me',

    getDriveFileMetadata: 'get-drive-file-metadata',
    getDriveFilePermissions: 'get-drive-file-permissions',
    updateDriveFilePermissions: 'update-drive-file-permissions',
    copyDriveFile: 'copy-drive-file',
    moveDriveFile: 'move-drive-file',
    searchDriveFiles: 'search-drive-files',
    removeDriveFileAccess: 'remove-drive-file-access',
    setDriveLinkPermission: 'set-drive-link-permission',
    deleteDriveFile: 'delete-drive-file',
    duplicateDriveFile: 'duplicate-drive-file',

    getSheetIdsByName: 'get-sheet-ids-by-name',
    createSpreadsheet: 'create-spreadsheet',
    deleteSpreadsheet: 'delete-spreadsheet',
    renameSpreadsheet: 'rename-spreadsheet',
    shareSpreadsheet: 'share-spreadsheet',
    unshareSpreadsheet: 'unshare-spreadsheet',

    getDocIdsByName: 'doc-ids-by-name',
    getDocMetadata: 'get-doc-metadata',
    createDoc: 'create-doc',
    deleteDoc: 'delete-doc',
    renameDoc: 'rename-doc',

    /** google sheet */
    appendSheetTabRow: 'append-sheet-tab-row',
    deleteRow: 'delete-row',
    clearRanges: 'clear-ranges',    // batchClear in remix
    updateRanges: 'update-ranges',  // update in remix
    getSheetTabContent: 'get-sheet-tab-content',
    addSheetTab: 'add-sheet-tab',
    renameSheetTab: 'rename-sheet-tab',
    deleteSheetTab: 'delete-sheet-tab',
    addSheetTabContent: 'add-sheet-tab-content',
    updateSheetTabContent: 'update-sheet-tab-content',
    insertColumn: 'insert-column',
    deleteColumn: 'delete-column',
    addChart: 'add-chart',
    sort: 'sort',
    filter: 'filter',
    functions: 'functions',
    addConditionalFormatting: 'add-conditional-formatting',
    // getAllConditionalFormatting: 'get-all-conditional-formatting',
    clearAllConditionalFormatting: 'clear-all-conditional-formatting',
    freezeRowsColumns: 'freeze-rows-columns',
    unfreezeRowsColumns: 'unfreeze-rows-columns',
    customCellFormatting: 'custom-cell-formatting',
    clearAllCustomCellFormattingSheet: 'clear-all-custom-cell-formatting-sheet',
    duplicateSheetTab: 'duplicate-sheet-tab',     // copySheet in remix
    mergeCells: 'merge-cells',
    unmergeCells: 'unmerge-cells',
    setHeightWidth: 'set-height-width',
    protectCells: 'protect-cells',
    insertLinkSheetTab: 'insert-link-sheet-tab',

    /** google doc */
    getDocContent: 'get-doc-content',
    appendDocText: 'append-doc-text',
    addDocTab: 'add-doc-tab',   // should support adding subtab                     // @arka
    renameDocTab: 'rename-doc-tab',                                                 // @arka
    deleteDocTab: 'delete-doc-tab',                                                 // @arka
    findTextIndices: 'find-text-indices',
    insertTextAtPosition: 'insert-text-at-position',
    findAndReplaceTextDoc: 'find-and-replace-text-doc',
    deleteTextRange: 'delete-text-range',
    insertImage: 'insert-image',
    insertTable: 'insert-table',
    updateTable: 'update-table',
    deleteElement: 'delete-element',
    applyTextStyle: 'apply-text-style',
    applyParagraphStyle: 'apply-paragraph-style',
    applyNamedStyle: 'apply-named-style',
    setBackgroundColor: 'set-background-color',
    setListStyle: 'set-list-style',
    clearAllFormattingDoc: 'remove-all-formatting-doc',
    insertLinkDoc: 'insert-link-doc',                                               // TODO: Use findTextIndices, add support of table
    unLinkDoc: 'unlink-doc',
    addCommentDoc: 'add-comment-doc',
    deleteCommentDoc: 'delete-comment-doc',
    listCommentsDoc: 'list-comments-doc',
    copyDoc: 'copy-doc',
    exportDoc: 'export-doc',
    shareDoc: 'share-doc',
    unshareDoc: 'unshare-doc',
}

const constants = {
    sessionTokenFile: 'google_workspace_session.json',
}

export {tools, constants};
