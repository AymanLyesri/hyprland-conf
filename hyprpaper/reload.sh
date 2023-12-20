#!/bin/bash

current_script=$(basename "$0")          # Get the current script's filename
other_pids=$(pgrep -f "$current_script") # Get the PIDs of all other scripts with the same name

for pid in $other_pids; do
    if [ "$pid" != "$$" ]; then     # $$ represents the PID of the current script
        echo "Killing process $pid" # This is just for debugging
        kill "$pid"                 # Kill the other script
    fi
done

#############################################

hyprctl hyprpaper unload all
killall load.sh   # kill load.sh
killall hyprpaper # kill hyprpaper

sleep 1

source $HOME/.config/hypr/hyprpaper/load.sh
