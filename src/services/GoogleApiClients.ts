import type {Auth} from 'googleapis';

class GoogleApiClientFactory {
    static createDriveClient(auth: Auth.OAuth2Client) {
        const {google} = require('googleapis');
        return google.drive({version: 'v3', auth});
    }

    static createSheetsClient(auth: Auth.OAuth2Client) {
        const {google} = require('googleapis');
        return google.sheets({version: 'v4', auth});
    }

    static createDocsClient(auth: Auth.OAuth2Client) {
        const {google} = require('googleapis');
        return google.docs({version: 'v1', auth});
    }
}

export {GoogleApiClientFactory};
