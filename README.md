# 🚀 Google Workspace MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Workspace (Drive, Spreadsheet, Docs) capabilities

---

## ⚙️ Quick Start

### 1. 📁 Clone the repo
```
git clone https://github.com/chayan-1906/Google-Workspace-MCP.git
cd Google-Workspace-MCP
```

### 2. 📦 Install dependencies
```
npm install
```

## User Guide -- https://versed-blinker-33e.notion.site/Google-Workspace-MCP-User-Guide-20f0c027172280c8b84fd90fbe67596c

## 🧰 Available Tools

| Tool Name                           | Description                                                                                       |
|-------------------------------------|---------------------------------------------------------------------------------------------------| 
| `myDetails`                         | Fetches the authenticated user's email address                                                    |
|                                     |                                                                                                   |
| `getFolderIdsByName`                | Finds the Google Drive folder IDs by folder name                                                  |
| `getFolderContentById`              | Finds the Google Drive folder contents by folder ID                                               |
| `getSheetIdsByName`                 | Finds the Google Spreadsheet IDs by spreadsheet name                                              |
| `createSpreadsheet`                 | Creates a new Google Spreadsheet in the specified Drive folder                                    |
| `deleteSpreadsheet`                 | The ID of the spreadsheet to delete                                                               |
| `renameSpreadsheet`                 | Renames an existing Google Spreadsheet by the spreadsheet ID                                      |
| `shareSpreadsheet`                  | Shares the Google Spreadsheet with one or more users                                              |
| `unshareSpreadsheet`                | Unshares the spreadsheet from specific email addresses (ignores if not shared)                    |
| `getDocIdsByName`                   | Finds the Google Doc IDs by doc name                                                              |
| `getDocMetadata`                    | Fetches basic metadata for a Google Doc (title, timestamps, owners)                               |
| `createDoc`                         | Creates a new Google Doc in the specified Drive folder                                            |
| `deleteDoc`                         | Deletes a Google Docs document                                                                    |
| `renameDoc`                         | Renames a Google Docs document                                                                    |
|                                     |                                                                                                   |
| `appendSheetRow`                    | Appends a new row to an existing sheet                                                            |
| `deleteRow`                         | Deletes one or more rows in a sheet tab                                                           |
| `clearRanges`                       | Clears certain ranges from a Google Spreadsheet                                                   |
| `updateRanges`                      | Updates specific ranges in a Google Spreadsheet                                                   |
| `getSheetContent`                   | Fetches values from a specific sheet range                                                        |
| `addSheet`                          | Creates a new sheet tab in a Google Spreadsheet                                                   |
| `renameSheet`                       | Renames a sheet tab in Google Spreadsheet                                                         |
| `deleteSheet`                       | Deletes a sheet tab by its numeric sheet ID                                                       |
| `addSheetContent`                   | Adds new content (rows) to a specified range in a Google Spreadsheet                              |
| `updateSheetContent`                | Overwrites content in a specific Google Spreadsheet ranges                                        |
| `insertColumn`                      | Inserts a new column in a sheet at a specific position in Google Spreadsheet                      |
| `deleteColumn`                      | Deletes one or more columns in a sheet tab from Google Spreadsheet                                |
| `addChart`                          | Adds a chart to the specified sheet in Google Spreadsheet                                         |
| `sort`                              | Sorts a row range by one or more column indexes in Google Spreadsheet                             |
| `filter`                            | Applies filter view to a specified cell range in Google Spreadsheet                               |
| `functions`                         | Applies spreadsheet function formulas (e.g., SUM, AVERAGE) to specific cell in Google Spreadsheet |
| `addConditionalFormatting`          | Adds conditional formatting to a range in a Google Sheet                                          |
| `clearAllConditionalFormatting`     | Clears all conditional formatting rules in a sheet                                                |
| `freezeRowsColumns`                 | Freezes specified number of rows and columns in a sheet in Google Spreadsheet                     |
| `unfreezeRowsColumns`               | Removes any frozen rows or columns from the Google Spreadsheet                                    |
| `customCellFormatting`              | Applies custom formatting to a specified cell range in a Google Spreadsheet                       |
| `clearAllCustomCellFormattingSheet` | Clears all custom cell formatting (like font, color, alignment) from the given Google SpreadSheet |
| `duplicateSheet`                    | Duplicates a sheet and assigns a new name                                                         |
| `mergeCells`                        | Merges a specified cell range in a sheet using a selected merge type in Google Spreadsheet        |
| `unmergeCells`                      | Unmerges cells in the given range on a Google Spreadsheet                                         |
| `setHeightWidth`                    | Sets row height or column width in a Google Spreadsheet                                           |
| `protectCells`                      | Adds a protected range to specific cells with a warning in a Google Spreadsheet                   |
| `insertLinkSheet`                   | Inserts a hyperlink into a specific cell in Google Spreadsheet                                    |
|                                     |                                                                                                   |
| `getDocContent`                     | Retrieves the plain text content of a Google Docs document                                        |
| `appendDocText`                     | Appends text to the end of a Google Docs document                                                 |
| `findTextIndices`                   |                                                                                                   |
| `insertTextAtPosition`              | Inserts text at a specific position in a Google Docs document'                                    |
| `findAndReplaceTextDoc`             | Finds and replaces a specific or all occurrences of a string in a Google Doc                      |
| `deleteTextRange`                   | Deletes specific content ranges in a Google Docs document using precomputed start and end indices |
| `insertLinkDoc`                     | Inserts a hyperlink into a Google Docs document at a specified position                           |
| `unLinkDoc`                         |                                                                                                   |
| `insertImage`                       |                                                                                                   |
| `insertTable`                       |                                                                                                   |
| `deleteElement`                     |                                                                                                   |
| `applyTextStyle`                    |                                                                                                   |
| `applyParagraphStyle`               |                                                                                                   |
| `applyNamedStyle`                   |                                                                                                   |
| `setBackgroundColor`                |                                                                                                   |
| `setListStyle`                      |                                                                                                   |
| `clearAllFormattingDoc`             |                                                                                                   |
| `addCommentDoc`                     |                                                                                                   |
| `deleteCommentDoc`                  |                                                                                                   |
| `listCommentsDoc`                   |                                                                                                   |
| `copyDoc`                           |                                                                                                   |
| `exportDoc`                         |                                                                                                   |
| `shareDoc`                          |                                                                                                   |
| `unshareDoc`                        |                                                                                                   |

## 🧪 Run the MCP Server
```
npm run dev
```
Or compile and run:
```
npm run package
```

## 👨‍💻 Tech Stack

• 🟦 **TypeScript** – Type-safe application development

*📁 **Google Drive API v1** – Folder and file operations (fetch folders/files, create, delete, rename)

•📄 **Google Sheets API v4** – Full spreadsheet automation: create/delete/rename spreadsheets, manipulate sheets, rows, columns, charts, formatting, and access control

•📄 **Google Docs API v3** – Advanced document operations: content editing, structure manipulation (tabs, tables, images), formatting, commenting, sharing, and exporting

•🧠 **MCP SDK** – Model Context Protocol server framework

•✅ **Zod** – Schema-based input validation

•🌱 **dotenv** – Environment variable management

for /f "tokens=5" %a in ('netstat -aon ^| findstr :20251') do taskkill /F /PID %a