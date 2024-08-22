#!/bin/bash

# Set the target and interval
TARGET="google.com"
INTERVAL=1

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No color

# Start testing
while true; do
    # Get the current date and time
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

    # Perform the ping and capture output
    PING_OUTPUT=$(ping -c 1 -W 2 $TARGET 2>&1)

    if echo "$PING_OUTPUT" | grep -q "1 received"; then
        # Extract the IP address and time from the ping output
        IP=$(echo "$PING_OUTPUT" | grep "PING" | awk -F'[()]' '{print $2}')
        TIME=$(echo "$PING_OUTPUT" | grep "time=" | awk -F'time=' '{print $2}' | cut -d' ' -f1)

        echo -e "[$TIMESTAMP] Testing connection to $TARGET ($IP): ${GREEN}Success${NC} - Response time: $TIME ms"
    else
        # Handle the failure case with more detailed output
        ERROR_MSG=$(echo "$PING_OUTPUT" | grep -oP "(?<=ping: ).*")
        echo -e "[$TIMESTAMP] Testing connection to $TARGET: ${RED}Failed${NC} - $ERROR_MSG"
    fi

    # Wait for the specified interval before the next test
    sleep $INTERVAL
done
