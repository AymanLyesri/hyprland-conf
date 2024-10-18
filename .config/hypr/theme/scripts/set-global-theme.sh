#!/bin/bash

hyprDir=$HOME/.config/hypr

if [ "$1" ]; then
    $hyprDir/theme/scripts/system-theme.sh switch $2

    sleep 1 && notify-send "Current theme" "$($hyprDir/theme/scripts/system-theme.sh get)"

fi

$hyprDir/theme/scripts/cursor-theme.sh &

$hyprDir/theme/scripts/wal-theme.sh &

$hyprDir/theme/scripts/gtk-theme.sh &
