#!/bin/bash

# Define the necessary directories and files
hyprDir=$HOME/.config/hypr
current_config=$hyprDir/hyprpaper/config/defaults.conf
previous_config=$hyprDir/hyprpaper/config/previous.conf

current_workspace=$(hyprctl monitors | grep active | awk '{print $3}') # get current workspace

# Check if the workspace ID is passed as an argument
if [ -z "$1" ]; then
    echo "Usage: previous.sh <workspace_id>"
    workspace_id=$current_workspace
else
    echo "Saving previous wallpaper for workspace $1"
    workspace_id=$1
fi

# Get the current wallpaper from the config file
current_wallpaper=$(grep "w-${workspace_id}" $current_config | cut -d'=' -f2)

# Get the previous wallpaper from the previous config file
old_previous_wallpaper=$(grep "w-${workspace_id}" $previous_config | cut -d'=' -f2)

# Preload and unload the wallpaper
hyprctl hyprpaper preload "$old_previous_wallpaper"
hyprctl hyprpaper unload "$current_wallpaper"

#############################################

if [ "$workspace_id" = "$current_workspace" ]; then
    $hyprDir/hyprpaper/w.sh "$old_previous_wallpaper" & # set wallpaper
fi

# If the current wallpaper is different from the previous one, update the previous config
if [ "$current_wallpaper" != "$old_previous_wallpaper" ]; then
    echo "Updating previous wallpaper for workspace $workspace_id"
    sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${old_previous_wallpaper}|" $current_config
    sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${current_wallpaper}|" $previous_config
fi
