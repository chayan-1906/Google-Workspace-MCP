import {Router} from 'express';
import path from "path";
import fs from "fs/promises";
import {sendError} from "../utils/sendError";
import {transport} from "../server";
import {createClaudeFileAndStoreSession, generateAndSaveSessionToken, getAuthUrl, getOAuth2Client, saveTokens} from "../services/OAuth";

const router = Router();

router.get('/auth', async (_req, res) => {
    res.redirect(await getAuthUrl());
});

router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('No code provided');

    try {
        const oauth2Client = await getOAuth2Client();

        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const {google} = await import('googleapis');
        const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
        const userInfoRes = await oauth2.userinfo.get();

        const email = userInfoRes.data.email;
        if (!email) return res.status(500).send('Failed to get user email');

        /** Save tokens object (received by oauth) in DB (collection: user_tokens) */
        await saveTokens(email, tokens);

        /** Generate and save a session token (collection: sessions) */
        const sessionToken = await generateAndSaveSessionToken(email);

        /** Save session token to a local file ($HOME/Library/Application Support/Claude/google_workspace_session.json) */
        await createClaudeFileAndStoreSession(sessionToken, email);

        // res.send(`Authentication successful! Your session token: ${sessionToken}<br>Email: ${email}`);
        /** return views/success.html */
        const filePath = path.join(__dirname, '..', 'views', 'success.html');

        try {
            const html = await fs.readFile(filePath, 'utf8');

            const filledHtml = html
                .replace('{{email}}', email)
                .replace('{{token}}', sessionToken);

            res.send(filledHtml);
        } catch (err) {
            console.error('Error reading HTML file:', err);
            res.status(500).send('Something went wrong');
        }
    } catch (error: any) {
        sendError(transport, error instanceof Error ? error : new Error(`Error in OAuth2: ${error.message}`), 'oauth-2');
        res.status(500).send(`Authentication failed: ${JSON.stringify(error)}`);
    }
});

export default router;
