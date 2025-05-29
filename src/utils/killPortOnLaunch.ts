import {printInConsole} from "./printInConsole";
import {PORT} from "../config/config";
import {promisify} from "util";
import {exec} from "child_process";
import {sendError} from "./sendError";
import {transport} from "../server";

const sleep = async (ms: number) => {
    await printInConsole(transport, 'Sleep start');
    await new Promise(resolve => setTimeout(resolve, ms));
    await printInConsole(transport, 'Sleep end');
}

async function killPortOnLaunch() {
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

async function freezePortOnQuit() {
    const claudePpid = process.ppid;
    setInterval(() => {
        try {
            // “signal 0” just tests existence
            process.kill(claudePpid, 0);
        } catch {
            sendError(transport, Error('Parent (Claude) no longer exists → exiting'), 'transport-close');
            process.exit(0);
        }
    }, 2000);
}

export {killPortOnLaunch, freezePortOnQuit}
