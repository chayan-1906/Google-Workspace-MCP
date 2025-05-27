const startTime = Date.now();

import {setupMcpTools} from "./controllers/ToolsController";
import 'dotenv/config';
import express from 'express';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {PORT} from "./config/config";
import AuthRoutes from "./routes/AuthRoutes";
import {printInConsole} from "./utils/printInConsole";

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use('/', AuthRoutes);

// Create an MCP server
const server = new McpServer({
    name: 'Google Workspace',
    version: '1.0.0',
});

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

app.listen(PORT, async () => {
    await printInConsole(transport, `OAuth server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);
    await startMcp();
    await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    // await connect(transport);
    // await printInConsole(transport, `OAuth server running on http://localhost:4000`)
});
