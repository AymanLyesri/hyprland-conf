#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)

hyprctl hyprpaper wallpaper "eDP-1,$random"

wal -i $random


