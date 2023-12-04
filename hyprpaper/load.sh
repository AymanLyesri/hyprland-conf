#!/bin/bash

hyprDir=$HOME/.config/hypr
random=$(find $hyprDir/wallpapers/normal -type f | shuf -n 1)
config=$hyprDir/hyprpaper.conf
monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}')
default_wallpaper=$($hyprDir/hyprpaper/default.sh)

#################################################

>$config

echo "preload = $default_wallpaper" >>$config
echo "" >>$config

for monitor in $monitors; do
    echo "wallpaper = $monitor,$default_wallpaper" >>$config
done

hyprpaper &

#################################################

source $hyprDir/wal/pywal $default_wallpaper

#################################################

for wallpaper in $(find $hyprDir/wallpapers/normal -type f); do
    hyprctl hyprpaper preload $wallpaper
done
