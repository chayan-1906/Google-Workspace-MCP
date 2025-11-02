# 🚀 Google Workspace MCP Server

**The Ultimate MCP Server for Google Workspace Automation** — Seamlessly integrate Google Drive, Sheets, and Docs with Claude AI and other AI agents through the Model Context Protocol (MCP).

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Workspace](https://img.shields.io/badge/Google_Workspace-4285F4?style=flat&logo=google&logoColor=white)](https://workspace.google.com/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io/)

---

![Google Workspace MCP](https://raw.githubusercontent.com/chayan-1906/Google-Workspace-MCP/master/google-workspace.png)

## 📖 Overview

Google Workspace MCP Server is a TypeScript-based Model Context Protocol server that empowers AI agents like Claude with **76 powerful tools** to interact with Google Workspace services. Automate document creation, spreadsheet manipulation, file management, and more—all through natural language conversations with AI.

### 🌟 Key Features

- **76 Comprehensive Tools** across Google Drive, Sheets, and Docs
- **Production-Ready** with OAuth 2.0 authentication
- **Type-Safe** implementation using TypeScript and Zod validation
- **Cross-Platform** executable support for easy deployment
- **Real-Time Operations** with Google Workspace APIs
- **Secure** credential management and session handling

---

## ⚙️ Quick Start

### 1. 📁 Clone the Repository

```bash
git clone https://github.com/chayan-1906/Google-Workspace-MCP.git
cd Google-Workspace-MCP
```

### 2. 📦 Install Dependencies

```bash
npm install
```

### 3. 🔧 Configure OAuth Credentials

Follow the [User Guide](https://versed-blinker-33e.notion.site/Google-Workspace-MCP-User-Guide-20f0c027172280c8b84fd90fbe67596c) for detailed setup instructions.

### 4. 🚀 Run the Server

```bash
npm run dev
```

Or build and package:

```bash
npm run package
```

---

## 🧰 Complete Tool Reference

### 👤 Profile (1 tool)

| Tool Name         | Description                                    |
|-------------------|------------------------------------------------|
| `myGoogleAccount` | Fetches the authenticated user's email address |

### 📁 Google Drive - Folder Management (8 tools)

| Tool Name                   | Description                                                       |
|-----------------------------|-------------------------------------------------------------------|
| `getDriveFolderIdsByName`   | Finds the Google Drive folder IDs by folder name                  |
| `getDriveFolderContentById` | Finds the Google Drive folder contents by folder ID               |
| `createDriveFolder`         | Creates a new folder in Google Drive                              |
| `copyDriveFolder`           | Copies a folder in Google Drive to a new location with a new name |
| `moveDriveFolder`           | Moves a folder to a different location in Google Drive            |
| `deleteDriveFolder`         | Permanently deletes a folder from Google Drive                    |
| `getDriveStorageQuota`      | Gets Google Drive storage quota and usage information             |
| `getDriveSharedWithMe`      | Lists files shared with the authenticated user                    |

### 📄 Google Drive - File Operations (10 tools)

| Tool Name                    | Description                                                                         |
|------------------------------|-------------------------------------------------------------------------------------|
| `getDriveFileMetadata`       | Gets detailed metadata for a Google Drive file                                      |
| `getDriveFilePermissions`    | Gets all permissions for a Google Drive file                                        |
| `updateDriveFilePermissions` | Updates permissions for a specific user on a Google Drive file                      |
| `copyDriveFile`              | Copies a file in Google Drive to a new location with a new name                     |
| `moveDriveFile`              | Moves a file to a different folder in Google Drive                                  |
| `deleteDriveFile`            | Permanently deletes a file from Google Drive                                        |
| `searchDriveFiles`           | Searches for files in Google Drive using query parameters                           |
| `removeDriveFileAccess`      | Removes access permissions for a specific user from a Google Drive file             |
| `setDriveLinkPermission`     | Sets link sharing permissions for a Google Drive file (anyone with link can access) |
| `duplicateDriveFile`         | Duplicates a file in the same folder with "Copy of" prefix                          |

### 📊 Google Spreadsheets - Document Management (6 tools)

| Tool Name            | Description                                                                    |
|----------------------|--------------------------------------------------------------------------------|
| `getSheetIdsByName`  | Finds the Google Spreadsheet IDs by spreadsheet name                           |
| `createSpreadsheet`  | Creates a new Google Spreadsheet in the specified Drive folder                 |
| `deleteSpreadsheet`  | Deletes a Google Spreadsheet from Drive permanently                            |
| `renameSpreadsheet`  | Renames an existing Google Spreadsheet by the spreadsheet ID                   |
| `shareSpreadsheet`   | Shares the Google Spreadsheet with one or more users                           |
| `unshareSpreadsheet` | Unshares the spreadsheet from specific email addresses (ignores if not shared) |

### 📝 Google Docs - Document Management (5 tools)

| Tool Name         | Description                                                         |
|-------------------|---------------------------------------------------------------------|
| `getDocIdsByName` | Finds the Google Doc IDs by doc name                                |
| `getDocMetadata`  | Fetches basic metadata for a Google Doc (title, timestamps, owners) |
| `createDoc`       | Creates a new Google Doc in the specified Drive folder              |
| `deleteDoc`       | Deletes a Google Docs document                                      |
| `renameDoc`       | Renames a Google Docs document                                      |

### 📈 Google Sheets - Data Manipulation (27 tools)

| Tool Name                           | Description                                                                                       |
|-------------------------------------|---------------------------------------------------------------------------------------------------|
| `appendSheetTabRow`                 | Appends a new row in an existing spreadsheet                                                      |
| `deleteRow`                         | Deletes one or more rows in a sheet tab                                                           |
| `clearRanges`                       | Clears certain ranges from a Google Spreadsheet                                                   |
| `updateRanges`                      | Updates specific ranges in a Google Spreadsheet                                                   |
| `getSheetTabContent`                | Fetches values from a specific sheet range in given Google Spreadsheet                            |
| `addSheetTab`                       | Creates a new sheet tab in Google Spreadsheet                                                     |
| `renameSheetTab`                    | Renames a sheet tab in Google Spreadsheet                                                         |
| `deleteSheetTab`                    | Deletes a sheet tab by its numeric sheet tab ID                                                   |
| `addSheetTabContent`                | Adds new content (rows) to a specified range in a Google Spreadsheet                              |
| `updateSheetTabContent`             | Overwrites content in a specific Google Spreadsheet range                                         |
| `insertColumn`                      | Inserts a new column in a sheet at a specific position in Google Spreadsheet                      |
| `deleteColumn`                      | Deletes one or more columns in a sheet tab from Google Spreadsheet                                |
| `addChart`                          | Adds a chart to the specified sheet in Google Spreadsheet                                         |
| `sortSheet`                         | Sorts a row range by one or more column indexes in Google Spreadsheet                             |
| `filterSheet`                       | Applies filter view to a specified cell range in Google Spreadsheet                               |
| `functions`                         | Applies spreadsheet function formulas (e.g., SUM, AVERAGE) to specific cell in Google Spreadsheet |
| `addConditionalFormatting`          | Adds conditional formatting to a range in a Google Spreadsheet                                    |
| `clearAllConditionalFormatting`     | Clears all conditional formatting rules in a sheet tab in Google Spreadsheet                      |
| `freezeRowsColumns`                 | Freezes specified number of rows and columns in a sheet in Google Spreadsheet                     |
| `unfreezeRowsColumns`               | Removes any frozen rows or columns from the Google Spreadsheet                                    |
| `customCellFormatting`              | Applies custom formatting to a specified cell range in a Google Spreadsheet                       |
| `clearAllCustomCellFormattingSheet` | Clears all custom cell formatting (like font, color, alignment) from the given Google Spreadsheet |
| `duplicateSheetTab`                 | Duplicates a sheet and assigns a new name in given Google Spreadsheet                             |
| `mergeCells`                        | Merges a specified cell range in a sheet using a selected merge type in Google Spreadsheet        |
| `unmergeCells`                      | Unmerges cells in the given range on a Google Spreadsheet                                         |
| `setHeightWidth`                    | Sets row height or column width in a Google Spreadsheet                                           |
| `protectCells`                      | Adds a protected range to specific cells with a warning in a Google Spreadsheet                   |
| `insertLinkSheet`                   | Inserts a hyperlink into a specific cell in Google Spreadsheet                                    |

### 📋 Google Docs - Content & Formatting (18 tools)

| Tool Name                   | Description                                                                                                                                     |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `getDocContent`             | Retrieves the complete plain text content from a Google Docs document, including text from tables and other elements                            |
| `appendDocText`             | Appends text content to the end of a Google Docs document                                                                                       |
| `findTextIndices`           | Finds all indices of a character or word in a Google Docs document, similar to Google Docs Find tool                                            |
| `insertTextAtPosition`      | Inserts text at a specific character position in a Google Docs document                                                                         |
| `deleteTextRange`           | Deletes specific content ranges in a Google Docs document using precomputed start and end indices                                               |
| `getParagraphRanges`        | Identifies paragraph boundaries and returns exact ranges for deletion                                                                           |
| `insertDocHyperlink`        | Adds a hyperlink to existing text in a Google Docs document. Links ALL occurrences of searchText or specific range                              |
| `removeDocHyperlinks`       | Removes hyperlinks from text in a Google Docs document. Can remove all hyperlinks or only those containing specific text                        |
| `exportDoc`                 | Exports a Google Doc to specified format and saves it in the same Drive folder                                                                  |
| `applyTextStyle`            | Applies text styling to a range of text in a Google Doc (bold, italic, color, font, etc.)                                                       |
| `applyParagraphStyle`       | Applies paragraph styling to a range of text in a Google Doc (alignment, spacing, indentation, etc.)                                            |
| `setListStyle`              | Applies list formatting (bullets or numbering) to a range of text in a Google Doc                                                               |
| `removeAllFormattingDoc`    | Removes all text and paragraph formatting from a range in a Google Doc                                                                          |
| `getAllCustomFormattingDoc` | Retrieves all custom formatting information from a Google Docs document, including text styles, paragraph styles, lists, and formatting details |
| `insertTable`               | Inserts a table with specified rows and columns at a given position in a Google Docs document                                                   |
| `updateTable`               | Updates a table in a Google Docs document by inserting/deleting rows/columns or updating cell content                                           |
| `deleteTable`               | Deletes a table from a Google Docs document by specifying its start and end index                                                               |
| `insertImage`               | Inserts an image from a URL into a Google Docs document at a specified position. Supports both public URLs and data URIs                        |

---

## 💡 Use Cases

### 📊 Data Analysis & Reporting

- Automatically generate reports from spreadsheet data
- Create charts and visualizations programmatically
- Apply conditional formatting based on data patterns

### 📝 Document Automation

- Generate documents from templates
- Bulk create and format Google Docs
- Export documents to multiple formats

### 🗂️ File Management

- Organize and structure Drive folders
- Manage permissions and sharing at scale
- Search and retrieve files based on criteria

### 🤖 AI-Powered Workflows

- Let AI agents read and write to your spreadsheets
- Enable Claude to edit documents based on instructions
- Automate repetitive Google Workspace tasks

---

## 🛠️ Tech Stack

| Technology               | Purpose                                                                                    |
|--------------------------|--------------------------------------------------------------------------------------------|
| **TypeScript**           | Type-safe application development                                                          |
| **Google Drive API v3**  | Folder and file operations (fetch, create, delete, rename, permissions)                    |
| **Google Sheets API v4** | Full spreadsheet automation (create, manipulate sheets, rows, columns, charts, formatting) |
| **Google Docs API v1**   | Advanced document operations (content editing, tables, images, formatting, exporting)      |
| **MCP SDK**              | Model Context Protocol server framework                                                    |
| **Zod**                  | Schema-based input validation                                                              |
| **googleapis**           | Official Google APIs Node.js client                                                        |
| **OAuth 2.0**            | Secure authentication and authorization                                                    |

---

## 🔐 Security & Privacy

- **OAuth 2.0** authentication ensures secure access
- **Session tokens** stored locally with encryption
- **Scoped permissions** - only requested Google Workspace access
- **No data storage** - all operations are direct API calls
- **Credential isolation** - user credentials never shared

---

## 🚀 Deployment

### Development Mode

```bash
npm run dev
```

## 📈 Project Stats

- **76 Tools** - Comprehensive Google Workspace automation
- **3 APIs** - Drive, Sheets, and Docs integration
- **Type-Safe** - Built with TypeScript for reliability
- **Production-Ready** - Used in real-world applications

---

## 🌟 Keywords

Google Workspace, MCP Server, Claude AI, TypeScript, Google Drive API, Google Sheets API, Google Docs API, Automation, AI Integration, Model Context Protocol, OAuth 2.0, Document Automation, Spreadsheet Automation, File Management, AI Agents, LLM Integration, API Integration, Cross-Platform, Node.js, Workspace Productivity
