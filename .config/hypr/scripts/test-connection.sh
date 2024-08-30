#!/bin/bash

# Set the target and interval
TARGET="google.com"
INTERVAL=1
SUCCESS_COUNT=0

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No color

# Function to measure max bandwidth by forcing download
measure_max_bandwidth() {
    # URL of a large file (change this to a reliable source)
    FILE_URL="http://speedtest.tele2.net/1GB.zip"
    echo "Testing maximum bandwidth by downloading a large file for 10 seconds..."

    # Download the file once, limiting the time to 10 seconds
    DOWNLOAD_OUTPUT=$(timeout 10 wget --output-document=/dev/null $FILE_URL 2>&1)

    # Extract the speed from the output
    DOWNLOAD_SPEED=$(echo "$DOWNLOAD_OUTPUT" | grep -oP '[0-9.]+[KM]B/s' | tail -1)

    if [ -n "$DOWNLOAD_SPEED" ]; then
        echo "Maximum observed download speed: $DOWNLOAD_SPEED"
    else
        echo "Could not determine download speed. The download might have been too short."
    fi
}

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

        # Increment the success count
        ((SUCCESS_COUNT++))

        # Check if we have 3 consecutive successes
        if [ $SUCCESS_COUNT -ge 3 ]; then
            echo -e "[$TIMESTAMP] 3 consecutive successful pings detected. Forcing maximum bandwidth..."
            measure_max_bandwidth
            SUCCESS_COUNT=0
        fi
    else
        # Handle the failure case with more detailed output
        ERROR_MSG=$(echo "$PING_OUTPUT" | grep -oP "(?<=ping: ).*")
        echo -e "[$TIMESTAMP] Testing connection to $TARGET: ${RED}Failed${NC} - $ERROR_MSG"

        # Reset the success count on failure
        SUCCESS_COUNT=0
    fi

    # Wait for the specified interval before the next test
    sleep $INTERVAL
done
