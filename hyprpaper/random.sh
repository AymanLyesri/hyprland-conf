#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)

wal -i $random &

monitor=$(hyprctl monitors | grep Monitor | awk '{print $2}')

hyprctl hyprpaper wallpaper "$monitor,$random"



