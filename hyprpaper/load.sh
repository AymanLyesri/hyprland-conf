#!/bin/bash

random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1)
config=/home/ayman/.config/hypr/hyprpaper.conf
monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}')

>$config

echo "preload = $random" >>$config
echo "" >>$config

for monitor in $monitors; do
    echo "wallpaper = $monitor,$random" >>$config
done

hyprpaper &

#################################################

source /home/ayman/.config/hypr/wal/pywal $random

#################################################

for wallpaper in $(find /home/ayman/.config/hypr/wallpapers/normal -type f); do
    hyprctl hyprpaper preload $wallpaper
    # echo "preload = $wallpaper" >> $config
done
