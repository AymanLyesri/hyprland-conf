#!/bin/bash

hyprDir=$HOME/.config/hypr                       # hypr directory
defaults=$hyprDir/hyprpaper/config/defaults.conf # config file
wallpapers=$(awk -F'=' '{print $2}' $defaults)   # get wallpapers
hyprpaper_conf=$hyprDir/hyprpaper.conf           # hyprpaper config

default_wallpapers=$HOME/.config/wallpapers/default # default wallpapers directory
custom_wallpapers=$HOME/.config/wallpapers/custom   # custom wallpapers directory
all_wallpapers=$HOME/.config/wallpapers/all         # all wallpapers directory

#################################################

rm -rf $all_wallpapers && mkdir -p $all_wallpapers && cp -r $default_wallpapers/* $custom_wallpapers/* $all_wallpapers # copy default and custom wallpapers to all wallpapers directory

#################################################

# loop through wallpapers
for wallpaper in $wallpapers; do
    hyprctl hyprpaper preload "$wallpaper" # preload wallpaper
done

#################################################

$hyprDir/hyprpaper/auto.sh & # start auto wallpaper script
