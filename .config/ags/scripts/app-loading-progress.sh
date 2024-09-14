#!/bin/sh

# Check for argument
if [ -z "$1" ]; then
    echo "Usage: $0 <app_name>"
    exit 1
fi

app_name="$1"

# Function to check if the specified application is present
is_app_present() {
    # Capture output of hyprctl clients for debugging
    output=$(hyprctl clients)
    found=$(echo "$output" | grep -qiE "class: *${app_name}*|title: *${app_name}*" && echo 1 || echo 0)
    echo $found
    # Check if any window has the specified class or title containing app_name
    if [ "$found" -eq 1 ]; then
        return 0
    else
        return 1
    fi
}

handle() {
    # Call the function and store its exit status
    if is_app_present "$app_name"; then
        echo "$app_name is present"
        exit 0
    fi
}

socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do handle "$app_name"; done
