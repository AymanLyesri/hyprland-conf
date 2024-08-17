#!/bin/bash

# Function to check for updates
check_updates() {
    # Sync package databases
    # pacman -Sy

    # Check for updates without actually performing the upgrade
    updates=$(yay -Qu)

    if [ -z "$updates" ]; then
        message="Your system is up to date."
        notify-send "System Update" "$message"
    else
        # Count the number of updates
        update_count=$(echo "$updates" | wc -l)
        message="There are $update_count updates available."
        notify-send "System Update" "$message"
    fi
}

# Call the function
while true; do
    check_updates
    sleep 3600
done
