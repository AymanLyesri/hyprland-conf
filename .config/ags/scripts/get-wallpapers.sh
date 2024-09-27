#!/bin/bash

# Define the file that contains the wallpaper paths
file="$HOME/.config/hypr/hyprpaper/config/defaults.conf"

# Initialize an empty array for the wallpaper paths
wallpaper_paths=()

# Read the file line by line
while IFS='=' read -r key path; do
    # Trim any whitespace from the path and add to the array
    path=$(echo "$path" | sed "s~^\$HOME~$HOME~" | xargs )
    wallpaper_paths+=("\"$path\"")
done <"$file"

# Join the array elements with commas and print in the desired format
echo "[${wallpaper_paths[*]}]" | sed 's/ /, /g'
