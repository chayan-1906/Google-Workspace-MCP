import {Router} from 'express';
import {getAuthUrl, oauth2Client, saveTokens} from "../services/OAuth";
import {google} from "googleapis";
import {sendError} from "../utils/sendError";
import {transport} from "../server";
import {v4 as uuidv4} from 'uuid';
import {connect} from "../config/db";
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {printInConsole} from "../utils/printInConsole";

const router = Router();

router.get('/auth', (_req, res) => {
    res.redirect(getAuthUrl());
});

router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('No code provided');

    try {
        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
        const userInfoRes = await oauth2.userinfo.get();

        const email = userInfoRes.data.email;
        if (!email) return res.status(500).send('Failed to get user email');

        await saveTokens(email, tokens);

        // Generate and save a session token
        const sessionToken = uuidv4();
        const db = await connect(transport);
        await db.collection('sessions').insertOne({sessionToken, email});

        // Save session token to a local file
        const tokenFilePath = path.join(os.homedir(), '.claude', 'session_token.json');
        await printInConsole(transport, `tokenFilePath: ${tokenFilePath}`);
        await fs.mkdir(path.dirname(tokenFilePath), {recursive: true});
        await printInConsole(transport, 'folder created for sessionToken');
        await fs.writeFile(tokenFilePath, JSON.stringify({sessionToken, email}, null, 2), 'utf8');
        await printInConsole(transport, 'file written');

        res.send(`Authentication successful! Your session token: ${sessionToken}<br>Email: ${email}`);
    } catch (error: any) {
        sendError(transport, error instanceof Error ? error : new Error(`Error in OAuth2: ${error.message}`), 'oauth-2');
        res.status(500).send(`Authentication failed: ${JSON.stringify(error)}`);
    }
});

export default router;
