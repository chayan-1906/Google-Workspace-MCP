import express from 'express';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import AuthRoutes from "./routes/AuthRoutes";
import {PORT} from "./config/config";
import {setupMcpTools} from "./controllers/ToolsController";
import 'dotenv/config';
import {printInConsole} from "./utils/printInConsole";

const app = express();
export const transport = new StdioServerTransport();

app.use(express.json());
app.use('/', AuthRoutes);

// Create an MCP server
const server = new McpServer({
    name: 'Google Sheets',
    version: '1.0.0',
});

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server, /*[
        (server) => registerAddSheetTool(server, {
            CLIENT_ID: CLIENT_ID!,
            CLIENT_SECRET: CLIENT_SECRET!,
            REDIRECT_URI: REDIRECT_URI!,
        }),
    ]*/);
    await server.connect(transport);
}

startMcp();

app.listen(PORT, async () => {
    // await connect(transport);
    await printInConsole(transport, `OAuth server running on http://localhost:${PORT}`)
    // await printInConsole(transport, `OAuth server running on http://localhost:4000`)
});
