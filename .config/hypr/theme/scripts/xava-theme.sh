#!/bin/bash

hyprDir=$HOME/.config/hypr

current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)
xava_file=$HOME/.config/xava/config

# Create a temporary file
temp_xava_file=$(mktemp)

# Copy the original file to the temporary file
cp "$xava_file" "$temp_xava_file"

if [ "$current_theme" = "dark" ]; then
    # Xava file
    sed -i "s/foreground = white/foreground = black/" $temp_xava_file
    # Update the file's timestamp
    cat "$temp_xava_file" >"$xava_file"

elif [ "$current_theme" = "light" ]; then
    # Xava file
    sed -i "s/foreground = black/foreground = white/" $temp_xava_file
    # Update the file's timestamp
    cat "$temp_xava_file" >"$xava_file"
fi
