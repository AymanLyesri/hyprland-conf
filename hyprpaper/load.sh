#!/bin/bash

random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)
config=/home/ayman/.config/hypr/hyprpaper.conf

> $config

for wallpaper in $(find /home/ayman/.config/hypr/wallpapers/normal -type f)
do
    echo "preload = $wallpaper" >> $config
done

echo "" >> $config
echo "wallpaper = eDP-1,$random" >> $config

hyprpaper
