#!/bin/bash

# Docker entrypoint script for Next.js app
# This script replaces environment variable placeholders at runtime

echo "Starting Next.js application with runtime configuration..."

# Define the config file path
CONFIG_FILE="/app/public/config.js"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Warning: Config file not found at $CONFIG_FILE"
    exit 1
fi

echo "Replacing environment variables in config.js..."

# Replace placeholders with actual environment variable values
# Rewrite the file in place without sed -i (which needs a writable directory):
# only config.js itself is writable by the server user.
TMP_CONFIG=$(mktemp)
sed -e "s|__NEXT_PUBLIC_API_BASE_URL__|${NEXT_PUBLIC_API_BASE_URL:-http://localhost:5000/api}|g" \
    -e "s|__NEXT_PUBLIC_SITE_URL__|${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}|g" \
    -e "s|__NEXT_PUBLIC_ASSETS_URL__|${NEXT_PUBLIC_ASSETS_URL:-http://localhost:3000}|g" \
    "$CONFIG_FILE" > "$TMP_CONFIG" && cat "$TMP_CONFIG" > "$CONFIG_FILE"
rm -f "$TMP_CONFIG"

echo "Configuration updated:"
cat "$CONFIG_FILE"

# Start the Next.js standalone server (output: "standalone" emits server.js;
# `npm start` / `next start` do not work with a standalone build).
echo "Starting Next.js server..."
exec node server.js