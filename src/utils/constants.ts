const tools = {
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
    addChart: 'add-chart',
    sort: 'sort',                                                       // TODO - 11
    filter: 'filter',                                                   // TODO - 12
    functions: 'functions',                                             // TODO - 13
    addConditionalFormatting: 'add-conditional-formatting',             // TODO - 1
    getAllConditionalFormatting: 'get-all-conditional-formatting',      // TODO - 14
    clearAllConditionalFormatting: 'clear-all-conditional-formatting',  // TODO - 4
    freezeRowsColumns: 'freeze-rows-columns',                           // TODO - 9
    unfreezeRowsColumns: 'unfreeze-rows-columns',                       // TODO - 10
    customCellFormatting: 'custom-cell-formatting',                     // TODO - 2
    duplicateSheet: 'duplicate-sheet',     // copySheet in remix        // TODO - 3
    mergeCells: 'merge-cells',                                          // TODO - 7
    unmergeCells: 'unmerge-cells',                                      // TODO - 8
    setHeightWidth: 'set-height-width',                                 // TODO - 5
    protectCells: 'protect-cells',                                      // TODO - 6
}

export {tools};
