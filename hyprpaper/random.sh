#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)

monitor=$(hyprctl monitors | grep Monitor | awk '{print $2}')

##########################################

source /home/ayman/.config/hypr/wal/pywal $random

hyprctl hyprpaper wallpaper "$monitor,$random"



