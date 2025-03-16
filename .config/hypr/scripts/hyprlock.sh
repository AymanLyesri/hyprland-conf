#!/bin/bash

hyprDir=$HOME/.config/hypr
hyprlock=$hyprDir/hyprlock.conf

# sed -i "/background {/,/}/ s|path = .*$|path = $current_wallpaper|" $hyprlock

if [ $1 == "suspend" ]; then
    systemctl suspend
fi

# hyprctl dispatch dpms on

hyprlock
