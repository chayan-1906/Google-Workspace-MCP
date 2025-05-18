# 🚀 Google Sheets MCP Server

An MCP-compliant server built with TypeScript to extend Claude and other AI agents with Google Sheets capabilities

Supports:

- 📊 Append rows to existing sheets
- 📝 Add new sheets

---

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

| Tool Name         | Description                                     | Sample Prompts |
|-------------------|-------------------------------------------------|----------------| 
| `appuendRow`      | Appends a new row to an existing sheet          |                |
| `batchClear`      |                                                 |                |
| `update`          |                                                 |                |
| `getSheetContent` |                                                 |                |
| `addSheet`        | Creates a new sheet tab in a Google Spreadsheet |                |
| `addSheetContent` |                                                 |                |
| `deleteSheet`     |                                                 |                |
| `insertColumn`    |                                                 |                |
| `deleteColumn`    |                                                 |                |


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
