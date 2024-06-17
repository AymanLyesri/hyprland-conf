#!/bin/bash

# Path to the file containing colors
colors_file="$HOME/.cache/wal/colors"

# Function to handle notifications
handle_notification() {
    local app_name="$1"
    local replaces_id="$2"
    local app_icon="$3"
    local summary="$4"
    local body="$5"
    local color="$6"
    hyprctl notify 1 3000 "$color" "fontsize:14 $summary => $body "
}

# Monitor DBus for notifications
dbus-monitor "interface='org.freedesktop.Notifications'" | while read -r line; do
    if echo "$line" | grep -q "member=Notify"; then
        app_name=""
        replaces_id=""
        app_icon=""
        summary=""
        body=""
        # Read subsequent lines to extract notification details
        while read -r inner_line; do
            if echo "$inner_line" | grep -q "string"; then
                # Extract app_name
                if [ -z "$app_name" ]; then
                    app_name=$(echo "$inner_line" | grep -oP '(?<=string ")[^"]*')
                    continue
                fi
                # Extract summary
                if [ -z "$summary" ]; then
                    summary=$(echo "$inner_line" | grep -oP '(?<=string ")[^"]*')
                    continue
                fi
                # Extract body
                if [ -z "$body" ]; then
                    body=$(echo "$inner_line" | grep -oP '(?<=string ")[^"]*')
                    break
                fi
            elif echo "$inner_line" | grep -q "uint32"; then
                # Extract replaces_id
                if [ -z "$replaces_id" ]; then
                    replaces_id=$(echo "$inner_line" | grep -oP '(?<=uint32 )[^ ]*')
                    continue
                fi
            fi

        done

        # Read the contents of 'colors' file into an array
        mapfile -t colors_array <$colors_file
        color="rgb(${colors_array[2]//#/})"
        echo $color

        handle_notification "$app_name" "$replaces_id" "$app_icon" "$summary" "$body" "$color"
    fi
done
