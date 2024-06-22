#!/bin/bash

ewwDir=$HOME/.config/eww
hyprDir=$HOME/.config/hypr

lib_file=$ewwDir/bar/scss/theme.scss
config_file=$ewwDir/bar/config/theme.conf

current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

if [ "$current_theme" = "dark" ]; then

    echo """// Background color
\$background: black;
// Foreground color
\$foreground: white;""" >$lib_file

elif [ "$current_theme" = "light" ]; then

    echo """// Background color
\$background: white;
// Foreground color
\$foreground: black;""" >$lib_file

fi

# Refresh layout blur for notification bar
# bash $HOME/.config/eww/custom-layer.sh
