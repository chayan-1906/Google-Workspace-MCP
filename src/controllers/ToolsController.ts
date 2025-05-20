import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {transport} from "../server";
import path from "path";
import {google} from "googleapis";
import * as fs from "node:fs";
import {printInConsole} from "../utils/printInConsole";
import {getTokensForUser, saveTokens} from "../services/OAuth";
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} from "../config/config";
import {OAuth2Client} from "googleapis-common";
import {sendError} from "../utils/sendError";

async function setupMcpTools(server: McpServer) {
    const toolsDir = path.join(__dirname, '..', 'tools');

    const getAllToolFiles = (dir: string): string[] => {
        return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory() ? getAllToolFiles(fullPath) :
                (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) ? [fullPath] : [];
        });
    }

    await printInConsole(transport, toolsDir);
    const toolFiles = getAllToolFiles(toolsDir);

    const getOAuthClientForUser = async (email: string) => {
        const tokens = await getTokensForUser(email);
        if (!tokens) return null;

        const oauth2Client: OAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        oauth2Client.setCredentials(tokens);
        await printInConsole(transport, `existing tokens: ${JSON.stringify(tokens)}`);

        // Force refresh the access token and get updated tokens
        await printInConsole(transport, 'manually refreshing access_token');
        try {
            // Force refresh
            const accessToken = await oauth2Client.getAccessToken();
            if (!accessToken || !accessToken.token) {
                // throw new Error('Could not retrieve access token');
                sendError(transport, Error(`Could not retrieve access token: accessToken - ${accessToken} accessToken.token - ${accessToken.token}`), 'refresh-token');
                return null;
            }
            await printInConsole(transport, `access_token obtained: ${accessToken.token}`);

            const currentCredentials = oauth2Client.credentials;
            const mergedTokens = {
                ...currentCredentials,
                refresh_token: tokens.refresh_token, // Preserve refresh token
            };

            // oauth2Client.setCredentials(mergedTokens);
            await saveTokens(email, mergedTokens);

            await printInConsole(transport, 'Access token refreshed and saved to DB');
        } catch (error: any) {
            sendError(transport, new Error(`Failed to refresh token: ${error}`), 'refresh-token');
        }

        await printInConsole(transport, 'about to update token to DB');
        // Automatically refresh token and persist it if access token is updated
        oauth2Client.on('tokens', async (newTokens) => {
            const merged = {
                ...oauth2Client.credentials,
                ...newTokens,
                refresh_token: tokens.refresh_token,
            };
            await saveTokens(email, merged);
        });

        return oauth2Client;
    }

    for (const file of toolFiles) {
        // const modulePath = path.join(toolsDir, file);
        const modulePath = file;
        await printInConsole(transport, `modulePath: ${modulePath}`);
        const toolModule = await import(modulePath);

        if (typeof toolModule.registerTool === 'function') {
            toolModule.registerTool(server, getOAuthClientForUser);
        }
    }
}

export {setupMcpTools}
