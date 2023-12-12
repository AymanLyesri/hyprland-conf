#!/bin/bash

hyprDir=$HOME/.config/hypr                                     # hypr directory
random=$(find $hyprDir/wallpapers/normal -type f | shuf -n 1)  # get random wallpaper
config=$hyprDir/hyprpaper.conf                                 # hyprpaper config
monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}') # get monitors
default_wallpaper=$($hyprDir/hyprpaper/default.sh)             # get default wallpaper

#################################################

>$config # clear config

echo "preload = $default_wallpaper" >>$config # set preload wallpaper
echo "" >>$config                             # add new line

for monitor in $monitors; do                                 # loop through monitors
    echo "wallpaper = $monitor,$default_wallpaper" >>$config # set wallpaper
done

hyprpaper & # start hyprpaper

#################################################

source $hyprDir/wal/pywal $default_wallpaper # set wallpaper theme

#################################################

for wallpaper in $( # loop through wallpapers
    find $hyprDir/wallpapers/normal -type f
); do
    hyprctl hyprpaper preload $wallpaper # preload wallpaper
done

#################################################

source $hyprDir/hyprpaper/auto.sh & # start auto wallpaper script
