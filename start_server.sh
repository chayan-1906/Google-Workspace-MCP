#!/bin/bash

# Detect OS
OS="$(uname)"
HOME_DIR="$HOME"

# Set Claude config dir based on OS
if [[ "$OS" == "Darwin" ]]; then
  CLAUDE_CONFIG_DIR="$HOME_DIR/Library/Application Support/Claude"
elif [[ "$OS" == "Linux" ]]; then
  # Detect if WSL
  if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
    WIN_HOME="$(cmd.exe /c "echo %APPDATA%" 2>/dev/null | tr -d '\r')"
    CLAUDE_CONFIG_DIR="$WIN_HOME/Claude"
  else
    CLAUDE_CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME_DIR/.config}/Claude"
  fi
else
  echo "Unsupported OS: $OS"
  exit 1
fi

# Get project root (directory where this script lives)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables
ENV_PATH="$PROJECT_ROOT/.env"
if [[ -f "$ENV_PATH" ]]; then
  source "$ENV_PATH"
  export PORT CLIENT_ID CLIENT_SECRET GOOGLE_REDIRECT_URI MONGODB_URI TOKEN_SECRET
else
  echo "Error: .env file not found at $ENV_PATH"
  exit 1
fi

# Function to locate ts-node dynamically
find_ts_node() {
  if [[ "$OS" == "Darwin" ]]; then
    if [[ -x "/opt/homebrew/bin/ts-node" ]]; then
      echo "/opt/homebrew/bin/ts-node"
    elif [[ -x "/usr/local/bin/ts-node" ]]; then
      echo "/usr/local/bin/ts-node"
    elif command -v ts-node >/dev/null 2>&1; then
      command -v ts-node
    fi
  elif [[ "$OS" == "Linux" ]]; then
    if command -v ts-node >/dev/null 2>&1; then
      command -v ts-node
    fi
  fi
}

TS_NODE_BIN="$(find_ts_node)"
SERVER_ENTRY="$PROJECT_ROOT/src/server.ts"

# Run the server
if [[ -n "$TS_NODE_BIN" ]]; then
  exec "$TS_NODE_BIN" "$SERVER_ENTRY"
elif command -v npx >/dev/null 2>&1; then
  exec npx ts-node "$SERVER_ENTRY"
else
  echo "Error: ts-node not found."
  exit 1
fi
