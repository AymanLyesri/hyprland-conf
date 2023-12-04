#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)

monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}')

##########################################

for monitor in $monitors; do
    hyprctl hyprpaper wallpaper "$monitor,$random"
done

source /home/ayman/.config/hypr/wal/pywal $random

##########################################

source /home/ayman/.config/hypr/scripts/eww_reset # reset eww
