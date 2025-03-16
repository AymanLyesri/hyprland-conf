#!/bin/bash

# Define variables
hyprdir=$HOME/.config/hypr
wallpaper=$1 # This is passed as an argument to the script
monitor=$2

hyprctl hyprpaper wallpaper "$monitor,$wallpaper"

sleep 1 # Wait for wallpaper to be set (removes stuttering)

# Set wallpaper theme
"$hyprdir/theme/scripts/wal-theme.sh" "$wallpaper"
