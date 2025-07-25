import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {sendError} from "mcp-utils/utils";
import {transport} from "../../server";
import {PORT} from "../../config/config";
import {tools} from "../../utils/constants";
import {getEmailFromSessionToken, getSessionTokenFromSessionFile} from "../../services/OAuth";

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.myGoogleAccount,
        'Fetches the authenticated user\'s email address',
        {},
        async ({}) => {
            const sessionToken = await getSessionTokenFromSessionFile();
            if (!sessionToken) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Please authenticate first in this link "http://localhost:${PORT}/auth". 🔑`,
                        },
                    ],
                };
            }

            const email = await getEmailFromSessionToken();

            try {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Google account retrieved successfully! ✅\n\n📧 ${email}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch my google account details: ${error}`), tools.myGoogleAccount);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch myDetails ❌: ${error.message}`,
                        },
                    ],
                };
            }
        },
    );
}
