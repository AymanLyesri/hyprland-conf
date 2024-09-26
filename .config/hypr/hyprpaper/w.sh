#!/bin/bash

# Define variables
hyprdir=$HOME/.config/hypr
wallpaper=$1

# Get list of monitors
monitors=($(hyprctl monitors | awk '/Monitor/ {print $2}'))

# Set wallpaper for each monitor
for monitor in "${monitors[@]}"; do
    hyprctl hyprpaper wallpaper "$monitor,$wallpaper"
done

sleep 1 # Wait for wallpaper to be set (remove stutering)

# Set wallpaper theme
$hyprdir/theme/scripts/wal-theme.sh "$wallpaper"
