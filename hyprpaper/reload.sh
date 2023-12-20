#!/bin/bash

current_script=$(basename "$0") # Get the current script's filename

# Get the process IDs (PIDs) of other instances of the same script
other_pids=$(pgrep -f "$current_script")

# Loop through each PID and terminate the process, except for the current script
for pid in $other_pids; do
    if [ "$pid" != "$$" ]; then # $$ represents the PID of the current script
        echo "Killing process $pid"
        kill "$pid"
    fi
done

# killall load.sh & # kill this script
hyprctl hyprpaper unload all
killall load.sh   # kill load.sh
killall hyprpaper # kill hyprpaper

sleep 1

# run load.sh
source $HOME/.config/hypr/hyprpaper/load.sh
