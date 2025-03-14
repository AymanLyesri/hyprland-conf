#!/bin/bash

hyprDir=$HOME/.config/hypr                       # hypr directory
defaults=$hyprDir/hyprpaper/config/defaults.conf # config file

hyprpaper_conf=$hyprDir/hyprpaper/config/defaults.conf # hyprpaper config
backup=$hyprDir/hyprpaper/config/defaults.conf.bak     # backup config

default_wallpapers=$HOME/.config/wallpapers/default # default wallpapers directory
custom_wallpapers=$HOME/.config/wallpapers/custom   # custom wallpapers directory
all_wallpapers=$HOME/.config/wallpapers/all         # all wallpapers directory

#################################################
# copy default and custom wallpapers to all wallpapers directory
rm -rf $all_wallpapers && mkdir -p $all_wallpapers && cp -r $default_wallpapers/* $custom_wallpapers/* $all_wallpapers

echo "Wallpapers directory updated!"

# overwrite /usr/share/backgrounds with all wallpapers
rm -rf /usr/share/backgrounds/* && cp -r $all_wallpapers/* /usr/share/backgrounds

echo "Wallpapers for sddm updated!"

#################################################

if [ ! -s "$defaults" ]; then
    touch $defaults
    cp $backup $defaults

    echo "Config file created!"
fi

#################################################
wallpapers=$(awk -F'=' '{print $2}' $defaults) # get wallpapers
# loop through wallpapers
for wallpaper in $wallpapers; do
    hyprctl hyprpaper preload "$wallpaper" # preload wallpaper
done

echo "Wallpapers preloaded!"

#################################################

$hyprDir/hyprpaper/auto.sh & # start auto wallpaper script

echo "Auto wallpaper script started!"
