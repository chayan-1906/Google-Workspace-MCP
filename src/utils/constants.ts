const tools = {
    myDetails: 'my-details',

    getFolderIdsByName: 'get-folder-ids-by-name',
    getFolderContentById: 'get-folder-content-by-id',
    getSheetIdsByName: 'get-sheet-ids-by-name',
    createSpreadsheet: 'create-spreadsheet',
    deleteSpreadsheet: 'delete-spreadsheet',                            // TODO Future
    renameSpreadsheet: 'rename-spreadsheet',
    getDocIdsByName: 'doc-ids-by-name',
    getDocMetadata: 'get-doc-metadata',
    createDoc: 'create-doc',
    deleteDoc: 'delete-doc',
    renameDoc: 'rename-doc',

    appendSheetRow: 'append-sheet-row',
    deleteRow: 'delete-row',
    clearRanges: 'clear-ranges',    // batchClear in remix
    updateRanges: 'update-ranges',  // update in remix
    getSheetContent: 'get-sheet-content',
    addSheet: 'add-sheet',
    renameSheet: 'rename-sheet',
    deleteSheet: 'delete-sheet',
    addSheetContent: 'add-sheet-content',
    updateSheetContent: 'update-sheet-content',
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
    clearAllCustomCellFormattingSheet: 'clear-all-custom-cell-formatting-sheet',    // TODO Future
    duplicateSheet: 'duplicate-sheet',     // copySheet in remix
    mergeCells: 'merge-cells',
    unmergeCells: 'unmerge-cells',
    setHeightWidth: 'set-height-width',
    protectCells: 'protect-cells',
    insertLinkSheet: 'insert-link-sheet',
    shareSheet: 'share-sheet',                                                      // TODO Future
    unshareSheet: 'unshare-sheet',                                                  // TODO Future

    getDocContent: 'get-doc-content',
    appendDocText: 'append-doc-text',
    addDocTab: 'add-doc-tab',   // should support adding subtab                     // @arka
    renameDocTab: 'rename-doc-tab',                                                 // @arka
    deleteDocTab: 'delete-doc-tab',                                                 // @arka
    insertTextAtPosition: 'insert-text-at-position',
    replaceText: 'replace-text',                                                    // TODO: 1
    deleteTextRange: 'delete-text-range',                                           // TODO: 2
    insertLinkDoc: 'insert-link-doc',
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
    addCommentDoc: 'add-comment-doc',
    deleteCommentDoc: 'delete-comment-doc',
    listCommentsDoc: 'list-comments-doc',
    copyDoc: 'copy-doc',
    exportDoc: 'export-doc',
    shareDoc: 'share-doc',
    unshareDoc: 'unshare-doc',
}

export {tools};
