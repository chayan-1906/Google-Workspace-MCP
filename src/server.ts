import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {setupMcpTools} from "./controllers/ToolsController";
import process from 'process';
import express from 'express';
import {PORT} from "./config/config";
import AuthRoutes from "./routes/AuthRoutes";
import {printInConsole} from "./utils/printInConsole";
import {freezePortOnQuit, killPortOnLaunch} from "./utils/killPortOnLaunch";
import {addOrUpdateMCPServer} from "./config/updateClaudeConfig";

const startTime = Date.now();

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use('/', AuthRoutes);

// Create an MCP server
const server = new McpServer({
    name: 'Google Workspace',
    version: '1.0.0',
});

freezePortOnQuit();

const serverName = 'google-workspace-mcp';
const entry = {
    command: (process as any).pkg ? process.execPath : `${process.cwd()}/start_server.sh`,  // e.g. "C:\\Users\\USER\Downloads\\weather-mcp.exe" or "/Users/padmanabhadas"
    args: [],
    cwd: process.cwd(),         // wherever the user launched it from
};

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

killPortOnLaunch().then(async () => {
    app.listen(PORT, async () => {
        await printInConsole(transport, `OAuth server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);
        addOrUpdateMCPServer(serverName, entry);
        await startMcp();
        await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    });
});
