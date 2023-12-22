#!/bin/bash

lib_file=$HOME/.config/hypr/eww/bar/scss/theme.scss
config_file=$HOME/.config/hypr/eww/bar/config/theme.conf

theme=('black' 'white')

if [ "$1" = "dark" ]; then
    sed -i "s/theme=.*/theme=0/g" $config_file
    sed -i "2s/${theme[1]}/${theme[0]}/g" $lib_file
    sed -i "4s/${theme[0]}/${theme[1]}/g" $lib_file

elif [ "$1" = "light" ]; then
    sed -i "s/theme=.*/theme=1/g" $config_file
    sed -i "2s/${theme[0]}/${theme[1]}/g" $lib_file
    sed -i "4s/${theme[1]}/${theme[0]}/g" $lib_file

elif [ "$1" = "default" ]; then
    theme=$(grep -oP 'theme=\K\w+' $config_file)
    echo "$theme"
fi
