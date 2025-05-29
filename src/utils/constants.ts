const tools = {
    myDetails: 'my-details',

    sheetIdsByName: 'sheet-ids-by-name',
    folderIdsByName: 'folder-ids-by-name',
    folderContentById: 'folder-content-by-id',
    createSpreadsheet: 'create-spreadsheet',
    renameSpreadsheet: 'rename-spreadsheet',

    appendRow: 'append-row',
    deleteRow: 'delete-row',
    clearRanges: 'clear-ranges',    // batchClear in remix
    updateRanges: 'update-ranges',  // update in remix
    getSheetContent: 'get-sheet-content',
    addSheet: 'add-sheet',
    deleteSheet: 'delete-sheet',
    addSheetContent: 'add-sheet-content',
    updateSheetContent: 'update-sheet-content',
    insertColumn: 'insert-column',
    deleteColumn: 'delete-column',
    addChart: 'add-chart',                                              // TODO - 15
    sort: 'sort',                                                       // TODO - 11
    filter: 'filter',                                                   // TODO - 12
    functions: 'functions',                                             // TODO - 13
    addConditionalFormatting: 'add-conditional-formatting',
    // getAllConditionalFormatting: 'get-all-conditional-formatting',
    clearAllConditionalFormatting: 'clear-all-conditional-formatting',
    freezeRowsColumns: 'freeze-rows-columns',
    unfreezeRowsColumns: 'unfreeze-rows-columns',
    customCellFormatting: 'custom-cell-formatting',
    duplicateSheet: 'duplicate-sheet',     // copySheet in remix
    mergeCells: 'merge-cells',
    unmergeCells: 'unmerge-cells',
    setHeightWidth: 'set-height-width',
    protectCells: 'protect-cells',
    insertLink: 'insert-link',                                           // TODO - 16
}

export {tools};
