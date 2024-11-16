#!/bin/sh

# Check for argument
if [ -z "$1" ]; then
    echo "Usage: $0 <app_name>"
    exit 1
fi

app_name="$1"

# Function to get the workspace of a specific application
get_workspace() {
    local app_name="$1"

    # Get the window data from hyprctl
    window_data=$(hyprctl clients)

    # Use awk to extract the workspace for the specified application (case-insensitive)
    workspace=$(echo "$window_data" | awk -v app="$app_name" '
        BEGIN { found = 0 }
        tolower($0) ~ tolower(app) { found = 1 }
        found && $0 ~ /workspace:/ { split($0, a, " "); print a[2]; exit }
    ')

    if [ -n "$workspace" ]; then
        echo $workspace
    else
        echo 0
    fi
}

handle() {
    workspace=$(get_workspace "$1")
    # Check if workspace is greater than 0
    if [ "$workspace" -gt 0 ]; then
        echo $workspace
        exit 0
    fi
}

# Set a timeout of 1 minute
timeout=60
start_time=$(date +%s)

socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do
    handle "$app_name"

    # Check the elapsed time
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [ "$elapsed" -ge "$timeout" ]; then
        echo "Timeout reached: Exiting"
        exit 1
    fi
done
