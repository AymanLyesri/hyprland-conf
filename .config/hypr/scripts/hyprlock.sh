#!/bin/bash

hyprDir=$HOME/.config/hypr
current_wallpaper=$(cat $hyprDir/hyprpaper/config/current.conf)
hyprlock=$hyprDir/hyprlock.conf

# sed -i "/background {/,/}/ s|path = .*$|path = $current_wallpaper|" $hyprlock

if [ $1 == "suspend" ]; then
    systemctl suspend
fi

# hyprctl dispatch dpms on

hyprlock
