/** DELETE THIS FILE */

import {google} from 'googleapis';
import path from 'path';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} from "./config";

const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '../../credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
];

export const sheets = google.sheets({version: 'v4', auth});
