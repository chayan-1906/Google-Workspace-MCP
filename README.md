# 🚀 Google Sheets MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Sheets capabilities

Supports:

- 📊 Append rows to existing sheets
- 📝 Add new sheets

---

Mongo DB - https://cloud.mongodb.com/v2/6828b54979c07a64b3c1f574#/metrics/replicaSet/6828b88376e9d8445de8b84a/explorer/google-sheets/user_tokens/find
GCP - https://console.cloud.google.com/apis/credentials?authuser=2&project=cogent-wall-460113-t8

## ⚙️ Setup Instructions

### 1. 📁 Clone the repo
```
git clone https://github.com/chayan1906/Google-Sheets-MCP.git
cd Google-Sheets-MCP
```

### 2. 📦 Install dependencies
```
npm install
```

### 3. 🔐 Add your Google API credentials
Place your credentials.json file at the root level

project-root/

└── credentials.json

🧾 Need help generating this file? Follow this guide:  
👉 [How to create credentials.json for Google Sheets API (Notion)](https://curious-turnover-84b.notion.site/Google-Sheet-1eb1d464528f809f90e3f5d0ec35450b)

### 4. 🧠 Upload `mcp.json` to Claude Desktop
Sample -

```
{
    "mcpServers": {
        "google-sheets": {
            "command": "/Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-sheets-mcp/start_server.sh",
            "args": [],
            "cwd": "/Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-sheets-mcp"
        }
    }
}
```

Upload `mcp.json` content into the Claude Desktop app via Settings → Tools → Add tool

## 🧰 Available Tools

| Tool Name                       | Description                                                    | Sample Prompts |
|---------------------------------|----------------------------------------------------------------|----------------| 
| `getSheetIdsByName`             | Finds the Google Spreadsheet IDs by spreadsheet name           |                |
| `getFolderIdByName`             | Finds the Google Drive folder IDs by folder name               |                |
| `getFolderContentById`          | Finds the Google Drive folder contents by folder ID            |                |
| `createSpreadsheet`             | Creates a new Google Spreadsheet in the specified Drive folder |                |
| `renameSpreadsheet`             | Renames an existing Google Spreadsheet by the spreadsheet ID   |                |
|
| `appendRow`                     | Appends a new row to an existing sheet                         |                |
| `clearRanges`                   | Clears certain ranges from a Google Spreadsheet                |                |
| `updateRanges`                  | Updates specific ranges in a Google Spreadsheet                |                |
| `getSheetContent`               | Fetches values from a specific sheet range                     |                |
| `addSheet`                      | Creates a new sheet tab in a Google Spreadsheet                |                |
| `addSheetContent`               | Creates a new sheet tab in Google Spreadsheet                  |                |
| `deleteSheet`                   |                                                                |                |
| `insertColumn`                  |                                                                |                |
| `deleteColumn`                  |                                                                |                |
| `addChart`                      |                                                                |                |
| `sort`                          |                                                                |                |
| `filter`                        |                                                                |                |
| `functions`                     |                                                                |                |
| `addConditionalFormatting`      |                                                                |                |
| `getAllConditionalFormatting`   |                                                                |                |
| `clearAllConditionalFormatting` |                                                                |                |
| `freezeRowsColumns`             |                                                                |                |
| `unfreezeRowsColumns`           |                                                                |                |


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
