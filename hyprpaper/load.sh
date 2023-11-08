#!/bin/bash

random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)
config=/home/ayman/.config/hypr/hyprpaper.conf
monitor=$(hyprctl monitors | grep Monitor | awk '{print $2}')

> $config

for wallpaper in $(find /home/ayman/.config/hypr/wallpapers/normal -type f)
do
    echo "preload = $wallpaper" >> $config
done

echo "" >> $config
echo "wallpaper = $monitor,$random" >> $config

#################################################

hyprpaper
source /home/ayman/.config/hypr/wal/pywal $random
