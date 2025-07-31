const startTime = Date.now();

import express from 'express';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {addOrUpdateMCPServer, closeConnection, freezePortOnQuit, killPortOnLaunch, printInConsole, setEntry} from "mcp-utils/utils";
import {PORT} from "./config/config";
import AuthRoutes from "./routes/AuthRoutes";
import {setupMcpTools} from "./controllers/ToolsController";

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

const serverName = 'google-workspace';

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    await printInConsole(transport, 'SIGTERM received, closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await printInConsole(transport, 'SIGINT received, closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
});

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

killPortOnLaunch(PORT).then(async () => {
    app.listen(PORT, async () => {
        await printInConsole(transport, `OAuth server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);

        const {entry} = setEntry('') as any;
        await addOrUpdateMCPServer(serverName, entry);
        await startMcp();
        await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    });
});
