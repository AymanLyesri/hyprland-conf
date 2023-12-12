#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1) # get random wallpaper
monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}')                # get monitors

##########################################

for monitor in $monitors; do
    hyprctl hyprpaper wallpaper "$monitor,$random" # set wallpaper
done

source /home/ayman/.config/hypr/wal/pywal $random # set wallpaper theme

##########################################

source /home/ayman/.config/hypr/scripts/eww_reset # reset eww
