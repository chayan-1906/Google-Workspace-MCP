import {sendError} from "./utils/sendError";
import {setupMcpTools} from "./controllers/ToolsController";
import 'dotenv/config';
import express from 'express';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {PORT} from "./config/config";
import AuthRoutes from "./routes/AuthRoutes";
import {printInConsole} from "./utils/printInConsole";
import {exec} from 'child_process';
import {promisify} from 'util';

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

// Start receiving messages on stdin and sending messages on stdout
async function startMcp() {
    await setupMcpTools(server);
    await server.connect(transport);
}

// startMcp();

const sleep = async (ms: number) => {
    await printInConsole(transport, 'Sleep start');
    await new Promise(resolve => setTimeout(resolve, ms));
    await printInConsole(transport, 'Sleep end');
}

async function killPort() {
    await printInConsole(transport, `Attempting to kill port ${PORT}`);
    const execAsync = promisify(exec);

    try {
        const {stdout} = await execAsync(`lsof -ti:${PORT} || true`);
        const pids = stdout.trim().split('\n').filter(Boolean);
        await printInConsole(transport, `Found PIDs: ${pids.join(', ')}, #of pids: ${pids.length}`);

        if (!pids.length || pids.length === 0) {
            await printInConsole(transport, `No process using port ${PORT}`);
        } else {
            for (const pid of pids) {
                await execAsync(`kill -9 ${pid}`);
                await printInConsole(transport, `Killed PID ${pid}`);
            }

            await sleep(1000);
            await printInConsole(transport, `Port ${PORT} is now freed`);
        }
    } catch (error: any) {
        if (error.code === 123) {
            await printInConsole(transport, `Port ${PORT} is not in use`);
        } else {
            sendError(transport, error instanceof Error ? error : new Error(`Error killing port ${PORT}: ${error.message}`), 'port-killing');
        }
    }
}

killPort().then(async () => {
    // await waitForPortToFree();
    app.listen(PORT, async () => {
        await printInConsole(transport, `OAuth server running on http://localhost:${PORT}, started in ${Date.now() - startTime}ms`);
        await startMcp();
        await printInConsole(transport, `All tools loaded in ${Date.now() - startTime}ms`);
    });
});
