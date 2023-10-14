#!/bin/bash

hyprctl hyprpaper wallpaper "eDP-1,"$(find /home/ayman/.config/hypr/wallpapers -type f | shuf -n 1)
