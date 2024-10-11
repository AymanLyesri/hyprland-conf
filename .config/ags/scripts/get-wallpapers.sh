#!/bin/bash

# Define the file that contains the wallpaper paths
defaults="$HOME/.config/hypr/hyprpaper/config/defaults.conf"
all="$HOME/.config/wallpapers/normal"

# Initialize an empty array for the wallpaper paths
wallpaper_paths=()

# check if $1 == current
if [ "$1" == "--current" ]; then
    # Read the file line by line
    while IFS='=' read -r key path; do
        # Trim any whitespace from the path and add to the array
        path=$(echo "$path" | sed "s~^\$HOME~$HOME~" | xargs )
        wallpaper_paths+=("\"$path\"")
    done <"$defaults"

elif [ "$1" == "--all" ]; then
    # Read the folder and add all the wallpapers to the array
    for path in $all/*; do
        wallpaper_paths+=("\"$path\"")
    done
fi


# Join the array elements with commas and print in the desired format
echo "[${wallpaper_paths[*]}]" | sed 's/ /, /g'
