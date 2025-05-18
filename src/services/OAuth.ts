import {google} from 'googleapis';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} from "../config/config";
import {connect} from "../config/db";
import {transport} from "../server";
import {OAuth2Client} from "googleapis-common";

export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
) as OAuth2Client;

export const sheets = google.sheets({version: 'v4', auth: oauth2Client});

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
