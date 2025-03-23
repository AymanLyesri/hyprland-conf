#!/bin/bash

defaults="$HOME/.config/ags/assets/thumbnails/defaults"
custom="$HOME/.config/ags/assets/thumbnails/custom"

# Initialize an empty array for the wallpaper paths
wallpaper_paths=()

# check if $1 == current
if [ "$1" == "--defaults" ]; then
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
