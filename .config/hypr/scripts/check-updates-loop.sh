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
        # notify-send "System Update" "$message" --action="kitty yay -Syu":"Update Now"
        notify-send "System Update" "$message" \
            --hint=string:actions:'[["Update Now", "kitty yay -Syu"]]'
    fi
}

# Function to check if the repository needs a pull
check_pull_needed() {
    # Fetch the latest changes from the remote repository
    git fetch

    # Compare local and remote branches
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    # Check if the current branch is behind the remote branch
    if [ "$LOCAL" != "$REMOTE" ]; then
        # Get the number of commits we are behind
        BEHIND=$(git rev-list --count $LOCAL..$REMOTE)
        # notify-send "Repository Update" "We are behind by $BEHIND commits. Please pull the latest changes." --action="kitty git pull":"Pull Now"
        notify-send "Repository Update" "We are behind by $BEHIND commits. Please pull the latest changes." \
            --hint=string:actions:'[["Pull Now", "kitty git pull"]]'
    else
        notify-send "Repository Update" "No pull is needed."
    fi
}
# Call the function
while true; do
    # sleep 1m # Wait for 1 minute before checking for updates
    check_updates
    check_pull_needed
    sleep 1h # Check for updates every hour
done
