# 🚀 Google Workspace MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Workspace (Drive, Spreadsheet, Docs) capabilities

Supports:

- 📊 All Google Drive operations
- 📝 All Google Spreadsheet operations
- 📝 All Google Docs operations

---

Mongo DB - https://cloud.mongodb.com/v2/6828b54979c07a64b3c1f574#/metrics/replicaSet/6828b88376e9d8445de8b84a/explorer/google-workspace/sessions/find
GCP - https://console.cloud.google.com/apis/credentials?inv=1&invt=Abyg2Q&authuser=3&project=cogent-wall-460113-t8

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

| Tool Name                       | Description                                                                                       | Sample Prompts |
|---------------------------------|---------------------------------------------------------------------------------------------------|----------------| 
| `getSheetIdsByName`             | Finds the Google Spreadsheet IDs by spreadsheet name                                              |                |
| `getFolderIdByName`             | Finds the Google Drive folder IDs by folder name                                                  |                |
| `getFolderContentById`          | Finds the Google Drive folder contents by folder ID                                               |                |
| `createSpreadsheet`             | Creates a new Google Spreadsheet in the specified Drive folder                                    |                |
| `renameSpreadsheet`             | Renames an existing Google Spreadsheet by the spreadsheet ID                                      |                |
|
| `appendRow`                     | Appends a new row to an existing sheet                                                            |                |
| `deleteRow`                     | Deletes one or more rows in a sheet tab                                                           |                |
| `clearRanges`                   | Clears certain ranges from a Google Spreadsheet                                                   |                |
| `updateRanges`                  | Updates specific ranges in a Google Spreadsheet                                                   |                |
| `getSheetContent`               | Fetches values from a specific sheet range                                                        |                |
| `addSheet`                      | Creates a new sheet tab in a Google Spreadsheet                                                   |                |
| `deleteSheet`                   | Deletes a sheet tab by its numeric sheet ID                                                       |                |
| `addSheetContent`               | Adds new content (rows) to a specified range in a Google Spreadsheet                              |                |
| `updateSheetContent`            | Overwrites content in a specific Google Spreadsheet ranges                                        |                |
| `insertColumn`                  | Inserts a new column in a sheet at a specific position in Google Spreadsheet                      |                |
| `deleteColumn`                  | Deletes one or more columns in a sheet tab from Google Spreadsheet                                |                |
| `addChart`                      |                                                                                                   |                |
| `sort`                          | Sorts a row range by one or more column indexes in Google Spreadsheet                             |                |
| `filter`                        | Applies filter view to a specified cell range in Google Spreadsheet                               |                |
| `functions`                     | Applies spreadsheet function formulas (e.g., SUM, AVERAGE) to specific cell in Google Spreadsheet |                |
| `addConditionalFormatting`      | Adds conditional formatting to a range in a Google Sheet                                          |                |
| `clearAllConditionalFormatting` | Clears all conditional formatting rules in a sheet                                                |                |
| `freezeRowsColumns`             | Freezes specified number of rows and columns in a sheet in Google Spreadsheet                     |                |
| `unfreezeRowsColumns`           | Removes any frozen rows or columns from the Google Spreadsheet                                    |                |
| `customCellFormatting`          | Applies custom formatting to a specified cell range in a Google Spreadsheet                       |                |
| `duplicateSheet`                | Duplicates a sheet and assigns a new name                                                         |                |
| `mergeCells`                    | Merges a specified cell range in a sheet using a selected merge type in Google Spreadsheet        |                |
| `unmergeCells`                  | Unmerges cells in the given range on a Google Spreadsheet                                         |                |
| `setHeightWidth`                | Sets row height or column width in a Google Spreadsheet                                           |                |
| `protectCells`                  | Adds a protected range to specific cells with a warning in a Google Spreadsheet                   |                |
| `insertLink`                    | Inserts a hyperlink into a specific cell in Google Spreadsheet                                    |                |


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
