import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {tools} from "../../utils/constants";
import {sendError} from "../../utils/sendError";
import {transport} from "../../server";
import {getEmailFromSessionToken} from "../../services/OAuth";
import {PORT} from "../../config/config";

export const registerTool = (server: McpServer) => {
    server.tool(
        tools.myDetails,
        'Fetches the authenticated user\'s email address',
        {},
        async ({}) => {
            if (!process.env.CLAUDE_SESSION_TOKEN) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Please authenticate first in this link "http://localhost:${PORT}/auth". 🔑`,
                        },
                    ],
                };
            }

            const email = await getEmailFromSessionToken(process.env.CLAUDE_SESSION_TOKEN || '');

            try {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 I\'m ${email}`,
                        },
                    ],
                };
            } catch (error: any) {
                sendError(transport, new Error(`Failed to fetch myDetails: ${error}`), 'my-details');
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
