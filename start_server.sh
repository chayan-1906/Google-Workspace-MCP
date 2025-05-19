#!/bin/bash

# Load environment variables
source /Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-sheets-mcp/.env
export CLIENT_ID CLIENT_SECRET GOOGLE_REDIRECT_URI MONGODB_URI

# Extract sessionToken from JSON and export
export CLAUDE_SESSION_TOKEN=$(jq -r '.sessionToken' /Users/padmanabhadas/.claude/session_token.json)

# Run the server
exec /opt/homebrew/Cellar/node/23.11.0/bin/ts-node /Users/padmanabhadas/Chayan_Personal/NodeJs/mcp-servers/google-sheets-mcp/src/server.ts
