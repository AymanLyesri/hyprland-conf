#!/bin/bash

hyprDir=$HOME/.config/hypr                       # hypr directory
defaults=$hyprDir/hyprpaper/config/defaults.conf # config file
wallpapers=$(awk -F'=' '{print $2}' $defaults)   # get wallpapers
hyprpaper_conf=$hyprDir/hyprpaper.conf           # hyprpaper config

#############################################

>$hyprpaper_conf # clear config

echo "splash = true" >>$hyprpaper_conf          # set splash screen
for wallpaper in $wallpapers; do                # loop through wallpapers
    echo "preload=$wallpaper" >>$hyprpaper_conf # preload wallpaper
done

#################################################

hyprpaper &

sleep 1 # wait for hyprpaper to die

source $hyprDir/hyprpaper/auto.sh # start auto wallpaper script
