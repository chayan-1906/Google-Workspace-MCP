import {MongoClient} from 'mongodb';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {sendError} from "../utils/sendError";
import {config} from 'dotenv';
import {printInConsole} from "../utils/printInConsole";
import {MONGODB_URI} from "./config";

let db: any;

async function connect(transport: StdioServerTransport) {
    try {
        if (!MONGODB_URI) {
            sendError(transport, new Error('MONGODB_URI not defined'), 'db-config');
            return null;
        }

        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('google-sheets');
        await printInConsole(transport, 'Database connected');
    } catch (error: any) {
        sendError(transport, error instanceof Error ? error : new Error(String(error)), 'db-connection');
        process.exit(1);
    }
    return db;
}

export {connect}
