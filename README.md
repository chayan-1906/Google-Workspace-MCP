# 🚀 Google Workspace MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Workspace (Drive, Spreadsheet, Docs) capabilities

---

![logo](https://raw.githubusercontent.com/chayan-1906/Google-Workspace-MCP/master/google-workspace.png)

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

### User Guide -- https://versed-blinker-33e.notion.site/Google-Workspace-MCP-User-Guide-20f0c027172280c8b84fd90fbe67596c

## 🧰 Available Tools

| Tool Name                                | Description                                                                                                                                     |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `my-google-account`                      | Fetches the authenticated user's email address                                                                                                  |
| `get-drive-folder-ids-by-name`           | Finds the Google Drive folder IDs by folder name                                                                                                |
| `get-drive-folder-content-by-id`         | Finds the Google Drive folder contents by folder ID                                                                                             |
| `create-drive-folder`                    | Creates a new folder in Google Drive                                                                                                            |
| `copy-drive-folder`                      | Copies a folder in Google Drive to a new location with a new name                                                                               |
| `move-drive-folder`                      | Moves a folder to a different location in Google Drive                                                                                          |
| `delete-drive-folder`                    | Permanently deletes a folder from Google Drive                                                                                                  |
| `get-drive-storage-quota`                | Gets Google Drive storage quota and usage information                                                                                           |
| `get-drive-shared-with-me`               | Lists files shared with the authenticated user                                                                                                  |
| `get-drive-file-metadata`                | Gets detailed metadata for a Google Drive file                                                                                                  |
| `get-drive-file-permissions`             | Gets all permissions for a Google Drive file                                                                                                    |
| `update-drive-file-permissions`          | Updates permissions for a specific user on a Google Drive file                                                                                  |
| `copy-drive-file`                        | Copies a file in Google Drive to a new location with a new name                                                                                 |
| `move-drive-file`                        | Moves a file to a different folder in Google Drive                                                                                              |
| `delete-drive-file`                      | Permanently deletes a file from Google Drive                                                                                                    |
| `search-drive-files`                     | Searches for files in Google Drive using query parameters                                                                                       |
| `remove-drive-file-access`               | Removes access permissions for a specific user from a Google Drive file                                                                         |
| `set-drive-link-permission`              | Sets link sharing permissions for a Google Drive file (anyone with link can access)                                                             |
| `duplicate-drive-file`                   | Duplicates a file in the same folder with "Copy of" prefix                                                                                      |
| `get-sheet-ids-by-name`                  | Finds the Google Spreadsheet IDs by spreadsheet name                                                                                            |
| `create-spreadsheet`                     | Creates a new Google Spreadsheet in the specified Drive folder                                                                                  |
| `delete-spreadsheet`                     | Deletes a Google Spreadsheet from Drive permanently                                                                                             |
| `rename-spreadsheet`                     | Renames an existing Google Spreadsheet by the spreadsheet ID                                                                                    |
| `share-spreadsheet`                      | Shares the Google Spreadsheet with one or more users                                                                                            |
| `unshare-spreadsheet`                    | Unshares the spreadsheet from specific email addresses (ignores if not shared)                                                                  |
| `doc-ids-by-name`                        | Finds the Google Doc IDs by doc name                                                                                                            |
| `get-doc-metadata`                       | Fetches basic metadata for a Google Doc (title, timestamps, owners)                                                                             |
| `create-doc`                             | Creates a new Google Doc in the specified Drive folder                                                                                          |
| `delete-doc`                             | Deletes a Google Docs document                                                                                                                  |
| `rename-doc`                             | Renames a Google Docs document                                                                                                                  |
| `append-sheet-tab-row`                   | Appends a new row in an existing spreadsheet                                                                                                    |
| `delete-row`                             | Deletes one or more rows in a sheet tab                                                                                                         |
| `clear-ranges`                           | Clears certain ranges from a Google Spreadsheet                                                                                                 |
| `update-ranges`                          | Updates specific ranges in a Google Spreadsheet                                                                                                 |
| `get-sheet-tab-content`                  | Fetches values from a specific sheet range in given Google Spreadsheet                                                                          |
| `add-sheet-tab`                          | Creates a new sheet tab in Google Spreadsheet                                                                                                   |
| `rename-sheet-tab`                       | Renames a sheet tab in Google Spreadsheet                                                                                                       |
| `delete-sheet-tab`                       | Deletes a sheet tab by its numeric sheet tab ID                                                                                                 |
| `add-sheet-tab-content`                  | Adds new content (rows) to a specified range in a Google Spreadsheet                                                                            |
| `update-sheet-tab-content`               | Overwrites content in a specific Google Spreadsheet range                                                                                       |
| `insert-column`                          | Inserts a new column in a sheet at a specific position in Google Spreadsheet                                                                    |
| `delete-column`                          | Deletes one or more columns in a sheet tab from Google Spreadsheet                                                                              |
| `add-chart`                              | Adds a chart to the specified sheet in Google Spreadsheet                                                                                       |
| `sort-sheet`                             | Sorts a row range by one or more column indexes in Google Spreadsheet                                                                           |
| `filter-sheet`                           | Applies filterSheet view to a specified cell range in Google Spreadsheet                                                                        |
| `functions`                              | Applies spreadsheet function formulas (e.g., SUM, AVERAGE) to specific cell in Google Spreadsheet                                               |
| `add-conditional-formatting`             | Adds conditional formatting to a range in a Google Spreadsheet                                                                                  |
| `clear-all-conditional-formatting`       | Clears all conditional formatting rules in a sheet tab in Google Spreadsheet                                                                    |
| `freeze-rows-columns`                    | Freezes specified number of rows and columns in a sheet in Google Spreadsheet                                                                   |
| `unfreeze-rows-columns`                  | Removes any frozen rows or columns from the Google Spreadsheet                                                                                  |
| `custom-cell-formatting`                 | Applies custom formatting to a specified cell range in a Google Spreadsheet                                                                     |
| `clear-all-custom-cell-formatting-sheet` | Clears all custom cell formatting (like font, color, alignment) from the given Google Spreadsheet                                               |
| `duplicate-sheet-tab`                    | Duplicates a sheet and assigns a new name in given Google Spreadsheet                                                                           |
| `merge-cells`                            | Merges a specified cell range in a sheet using a selected merge type in Google Spreadsheet                                                      |
| `unmerge-cells`                          | Unmerges cells in the given range on a Google Spreadsheet                                                                                       |
| `set-height-width`                       | Sets row height or column width in a Google Spreadsheet                                                                                         |
| `protect-cells`                          | Adds a protected range to specific cells with a warning in a Google Spreadsheet                                                                 |
| `insert-link-sheet-tab`                  | Inserts a hyperlink into a specific cell in Google Spreadsheet                                                                                  |
| `get-doc-content`                        | Retrieves the complete plain text content from a Google Docs document, including text from tables and other elements                            |
| `append-doc-text`                        | Appends text content to the end of a Google Docs document                                                                                       |
| `find-text-indices`                      | Finds all indices of a character or word in a Google Docs document, similar to Google Docs Find tool                                            |
| `insert-text-at-position`                | Inserts text at a specific character position in a Google Docs document                                                                         |
| `delete-text-range`                      | Deletes specific content ranges in a Google Docs document using precomputed start and end indices                                               |
| `get-paragraph-ranges`                   | Identifies paragraph boundaries and returns exact ranges for deletion                                                                           |
| `insert-doc-hyperlink`                   | Adds a hyperlink to existing text in a Google Docs document. Links ALL occurrences of searchText or specific range                              |
| `remove-doc-hyperlinks`                  | Removes hyperlinks from text in a Google Docs document. Can remove all hyperlinks or only those containing specific text                        |
| `export-doc`                             | Exports a Google Doc to specified format and saves it in the same Drive folder                                                                  |
| `apply-text-style`                       | Applies text styling to a range of text in a Google Doc (bold, italic, color, font, etc.)                                                       |
| `apply-paragraph-style`                  | Applies paragraph styling to a range of text in a Google Doc (alignment, spacing, indentation, etc.)                                            |
| `set-list-style`                         | Applies list formatting (bullets or numbering) to a range of text in a Google Doc                                                               |
| `remove-all-formatting-doc`              | Removes all text and paragraph formatting from a range in a Google Doc                                                                          |
| `get-all-custom-formatting-doc`          | Retrieves all custom formatting information from a Google Docs document, including text styles, paragraph styles, lists, and formatting details |
| `insert-table`                           | Inserts a table with specified rows and columns at a given position in a Google Docs document                                                   |
| `update-table`                           | Updates a table in a Google Docs document by inserting/deleting rows/columns or updating cell content                                           |
| `delete-table`                           | Deletes a table from a Google Docs document by specifying its start and end index                                                               |
| `insert-image`                           | Inserts an image from a URL into a Google Docs document at a specified position. Supports both public URLs and data URIs                        |

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

* 📁 **Google Drive API v1** – Folder and file operations (fetch folders/files, create, delete, rename)

• 📄 **Google Sheets API v4** – Full spreadsheet automation: create/delete/rename spreadsheets, manipulate sheets, rows, columns, charts, formatting, and access control

• 📄 **Google Docs API v3** – Advanced document operations: content editing, structure manipulation (tabs, tables, images), formatting, commenting, sharing, and exporting

• 🧠 **MCP SDK** – Model Context Protocol server framework

• ✅ **Zod** – Schema-based input validation

• 🌱 **dotenv** – Environment variable management

for /f "tokens=5" %a in ('netstat -aon ^| findstr :20251') do taskkill /F /PID %a
