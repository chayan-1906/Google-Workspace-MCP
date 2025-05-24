export const a1ToGridRange = (a1Range: string) => {
    const match = /^(.+?)!([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(a1Range);
    if (!match) throw new Error(`Invalid A1 range: ${a1Range}`);

    const [, sheetName, startCol, startRow, endCol, endRow] = match;

    const colToIndex = (col: string) => col.split('').reduce((sum, char, i) => sum * 26 + (char.charCodeAt(0) - 64), 0) - 1;

    return {
        sheetName,
        gridRange: {
            sheetId: null, // Optional: can resolve sheetId from sheetName if needed
            startRowIndex: parseInt(startRow) - 1,
            endRowIndex: parseInt(endRow),
            startColumnIndex: colToIndex(startCol),
            endColumnIndex: colToIndex(endCol) + 1,
        },
    };
}
