import {Auth} from 'googleapis';
import {CLIENT_ID, CLIENT_SECRET, PORT, REDIRECT_URI} from "../config/config";
import {connect} from "../config/db";
import {transport} from "../server";
import type {OAuth2Client} from 'google-auth-library';
import {v4 as uuidv4} from "uuid";
import path from "path";
import os from "os";
import {printInConsole} from "../utils/printInConsole";
import fs from "fs/promises";
import {decryptToken, encryptToken} from "../utils/encryption";
import {sendError} from "../utils/sendError";

let oauth2Client: OAuth2Client;

export async function getOAuth2Client(): Promise<OAuth2Client> {
    if (!oauth2Client) {
        const {google} = await import('googleapis');
        oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    }
    return oauth2Client;
}

export const getOAuthClientForUser = async (email: string) => {
    const tokens = await getTokensForUser(email);
    if (!tokens) return null;

    const {google} = await import('googleapis');
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

export async function getAuthUrl() {
    await getOAuth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/docs',
        ],
        prompt: 'consent',
    });
}

export async function saveTokens(email: string, tokens: any) {
    const db = await connect(transport);
    const collection = db.collection('user_tokens');

    const encrypted = encryptToken(JSON.stringify(tokens));

    await collection.updateOne(
        {email},
        {$set: {tokens: encrypted}},
        {upsert: true}
    );

    // await getTokensForUser(email);
}

export async function getTokensForUser(email: string) {
    const db = await connect(transport);
    const collection = db.collection('user_tokens');
    const doc = await collection.findOne({email});

    if (!doc || !doc.tokens) return null;

    try {
        const decrypted = decryptToken(doc.tokens);
        const parsedDecrypted = JSON.parse(decrypted);
        await printInConsole(transport, parsedDecrypted);

        return parsedDecrypted;
    } catch (error: any) {
        sendError(transport, Error(`Failed to decrypt tokens: ${error}`), 'decrypt-token');
        return null;
    }
}

export async function getEmailFromSessionToken(sessionToken: string) {
    const db = await connect(transport);
    const collection = db.collection('sessions');
    const doc = await collection.findOne({sessionToken});

    return doc ? doc.email : null;
}

export async function generateAndSaveSessionToken(email: string): Promise<string> {
    const sessionToken = uuidv4();
    const db = await connect(transport);
    const collection = db.collection('sessions');
    await collection.updateOne(
        {email},
        {$set: {sessionToken, email}},
        {upsert: true},
    );

    return sessionToken;
}

export async function createClaudeFileAndStoreSession(sessionToken: string, email: string) {
    const tokenFilePath = path.join(os.homedir(), '.claude', 'session_token.json');
    await printInConsole(transport, `tokenFilePath: ${tokenFilePath}`);
    await fs.mkdir(path.dirname(tokenFilePath), {recursive: true});
    await printInConsole(transport, '.claude folder created');
    await fs.writeFile(tokenFilePath, JSON.stringify({sessionToken, email}, null, 2), 'utf8');
    await printInConsole(transport, 'session token has been added/updated in session_token.json');
}

interface GetOAuthClientResult {
    oauth2Client: Auth.OAuth2Client | null;
    response?: any;
}

export async function getOAuth2ClientFromEmail(getOAuthClientForUser: (email: string) => Promise<OAuth2Client | null>): Promise<GetOAuthClientResult> {
    await printInConsole(transport, `Received sessionToken: ${process.env.CLAUDE_SESSION_TOKEN}`);
    const token = process.env.CLAUDE_SESSION_TOKEN;
    await printInConsole(transport, `Using sessionToken: ${token}`);
    if (!token) {
        return {
            oauth2Client: null,
            response: {
                content: [
                    {
                        type: 'text',
                        text: `Please authenticate first in this link "http://localhost:${PORT}/auth". 🔑`,
                    },
                ],
            },
        };
    }

    const email = await getEmailFromSessionToken(token);
    await printInConsole(transport, `Email from token: ${email}`);
    if (!email) {
        return {
            oauth2Client: null,
            response: {
                content: [
                    {
                        type: 'text',
                        text: `Please authenticate again in this link "http://localhost:${PORT}/auth" 🔑`,
                    },
                ],
            },
        };
    }

    const oauth2Client = await getOAuthClientForUser(email);
    if (!oauth2Client) {
        return {
            oauth2Client: null,
            response: {
                content: [
                    {
                        type: 'text',
                        text: `Please authenticate first in this link "http://localhost:${PORT}/auth". 🔑`,
                    },
                ],
            },
        };
    }

    return {oauth2Client};
}
