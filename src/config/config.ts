import {config} from 'dotenv';

config();

export const {PORT, CLIENT_ID, CLIENT_SECRET, GOOGLE_REDIRECT_URI: REDIRECT_URI, MONGODB_URI} = process.env;
