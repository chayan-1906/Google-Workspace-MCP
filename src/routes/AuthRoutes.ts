import {Router} from 'express';
import {getAuthUrl, oauth2Client, saveTokens} from "../services/OAuth";
import {google} from "googleapis";
import {sendError} from "../utils/sendError";
import {transport} from "../server";

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

        res.send(`Authentication successful! Your email: ${email} ${JSON.stringify(tokens)}`);
    } catch (error: any) {
        sendError(transport, error instanceof Error ? error : new Error(`Error in OAuth2: ${error.message}`), 'oauth-2');
        res.status(500).send(`Authentication failed: ${JSON.stringify(error)}`);
    }
});

export default router;
