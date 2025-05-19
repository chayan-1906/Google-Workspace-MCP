import {Auth, google} from 'googleapis';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} from "../config/config";
import {connect} from "../config/db";
import {transport} from "../server";
import {OAuth2Client} from "googleapis-common";
import {v4 as uuidv4} from "uuid";
import path from "path";
import os from "os";
import {printInConsole} from "../utils/printInConsole";
import fs from "fs/promises";

export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
) as OAuth2Client;

export function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/drive',
        ],
        prompt: 'consent',
    });
}

export async function saveTokens(email: string, tokens: any) {
    const db = await connect(transport);
    const collection = db.collection('user_tokens');
    await collection.updateOne(
        {email},
        {$set: {tokens}},
        {upsert: true}
    );
}

export async function getTokensForUser(email: string) {
    const db = await connect(transport);
    const collection = db.collection('user_tokens');
    const doc = await collection.findOne({email});

    return doc ? doc.tokens : null;
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
                        text: 'No session token provided. Please authenticate first.',
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
                        text: 'Invalid session. Please authenticate again. 🔑',
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
                        text: 'User not authenticated. Please authenticate first. 🔑',
                    },
                ],
            },
        };
    }

    return {oauth2Client};
}
