#!/bin/bash

# Define the file that contains the wallpaper paths
hyprpaper_config="$HOME/.config/hypr/hyprpaper/config"
defaults="$HOME/.config/wallpapers/defaults"
custom="$HOME/.config/wallpapers/custom"

# Initialize an empty array for the wallpaper paths
wallpaper_paths=()

# check if $1 == current
if [ "$1" == "--current" ]; then
    # check if $2 is set
    if [ -z "$2" ]; then
        echo "Usage: get-wallpapers.sh --current <monitor>"
        exit 1
    else
        monitor=$2
    fi
    # Read the file line by line
    while IFS='=' read -r key path; do
        # Trim any whitespace from the path and add to the array
        path=$(echo "$path" | sed "s~^\$HOME~$HOME~" | xargs)
        wallpaper_paths+=("\"$path\"")
    done <"$hyprpaper_config/$monitor/defaults.conf"

elif [ "$1" == "--defaults" ]; then
    # Read the folder and add all the wallpapers to the array
    for path in $defaults/*; do
        wallpaper_paths+=("\"$path\"")
    done

elif [ "$1" == "--custom" ]; then
    # Read the folder and add all the wallpapers to the array
    for path in $custom/*; do
        wallpaper_paths+=("\"$path\"")
    done
else
    echo "Invalid argument"
    exit 1
fi

# Join the array elements with commas and print in the desired format
echo "[${wallpaper_paths[@]}]" | sed 's/" "/", "/g'
