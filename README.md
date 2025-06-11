# 🚀 Google Workspace MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Workspace (Drive, Spreadsheet, Docs) capabilities

Supports:

- 📊 All Google Drive operations
- 📝 All Google Spreadsheet operations
- 📝 All Google Docs operations

---

Mongo DB - https://cloud.mongodb.com/v2/6828b54979c07a64b3c1f574#/metrics/replicaSet/6828b88376e9d8445de8b84a/explorer/google-workspace/sessions/find

GCP - https://console.cloud.google.com/apis/credentials?inv=1&invt=Abyg2Q&authuser=3&project=cogent-wall-460113-t8

Deployed Server: https://google-workspace-mcp.onrender.com

## ⚙️ Setup Instructions

### 1. 📁 Clone the repo
```
git clone https://github.com/chayan1906/Google-Workspace-MCP.git
cd Google-Workspace-MCP
```

### 2. 📦 Install dependencies
```
npm install
```

### 3. 🧠 Upload `mcp.json` to Claude Desktop
Sample -

```
{
    "mcpServers": {
        "google-workspace": {
            "command": "/Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-workspace-mcp/start_server.sh",
            "args": [],
            "cwd": "/Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-workspace-mcp"
        }
    }
}
```

Upload `mcp.json` content into the Claude Desktop app via Settings → Tools → Add tool

## 🧰 Available Tools

| Tool Name                           | Description                                                                                       |
|-------------------------------------|---------------------------------------------------------------------------------------------------| 
| `myDetails`                         | Fetches the authenticated user's email address                                                    |
|                                     |                                                                                                   |
| `getFolderIdsByName`                | Finds the Google Drive folder IDs by folder name                                                  |
| `getFolderContentById`              | Finds the Google Drive folder contents by folder ID                                               |
| `getSheetIdsByName`                 | Finds the Google Spreadsheet IDs by spreadsheet name                                              |
| `createSpreadsheet`                 | Creates a new Google Spreadsheet in the specified Drive folder                                    |
| `deleteSpreadsheet`                 |                                                                                                   |
| `renameSpreadsheet`                 | Renames an existing Google Spreadsheet by the spreadsheet ID                                      |
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
| `clearAllCustomCellFormattingSheet` |                                                                                                   |
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
| `deleteTextRange`                   | Deletes text from a Google Docs document between two indices                                      |
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
npm run build
node dist/server.js
```

## 👨‍💻 Tech Stack

• 🟦 **TypeScript** – Type-safe development

•📄 **Google Sheets API v4** – Spreadsheet manipulation

•🧠 **MCP SDK** – Model Context Protocol server framework

•✅ **Zod** – Input schema validation

•🌱 **dotenv** – Environment variable management

for /f "tokens=5" %a in ('netstat -aon ^| findstr :20251') do taskkill /F /PID %a