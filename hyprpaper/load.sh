#!/bin/bash

hyprDir=$HOME/.config/hypr                       # hypr directory
defaults=$hyprDir/hyprpaper/config/defaults.conf # config file
wallpapers=$(awk -F'=' '{print $2}' $defaults)   # get wallpapers
hyprpaper_conf=$hyprDir/hyprpaper.conf           # hyprpaper config

#################################################

for wallpaper in $wallpapers; do           # loop through wallpapers
    hyprctl hyprpaper preload "$wallpaper" # preload wallpaper
done

#################################################

$hyprDir/hyprpaper/auto.sh & # start auto wallpaper script
