#!/bin/bash

hyprDir=$HOME/.config/hypr

icons=("✩" "☀")

current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

if [ "$current_theme" = "dark" ]; then

    echo ${icons[0]}

elif [ "$current_theme" = "light" ]; then

    echo ${icons[1]}

fi
