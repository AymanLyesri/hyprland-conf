#!/bin/bash

hyprDir=$HOME/.config/hypr                       # hypr directory
defaults=$hyprDir/hyprpaper/config/defaults.conf # config file
wallpapers=$(awk -F'=' '{print $2}' $defaults)   # get wallpapers
hyprpaper_conf=$hyprDir/hyprpaper.conf           # hyprpaper config

# renice -20 -p $(pgrep load.sh) # set hyprpaper priority to -20

#################################################

for wallpaper in $wallpapers; do           # loop through wallpapers
    hyprctl hyprpaper preload "$wallpaper" # preload wallpaper
done

#################################################

$hyprDir/hyprpaper/auto.sh & # start auto wallpaper script
