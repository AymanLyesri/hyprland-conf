#!/bin/bash

lib_file=bar/scss/theme.scss
config_file=bar/config/theme.conf
xava_file=$HOME/.config/xava/config

theme=('black' 'white')

# Create a temporary file
temp_xava_file=$(mktemp)

# Copy the original file to the temporary file
cp "$xava_file" "$temp_xava_file"

if [ "$1" = "dark" ]; then
    # Xava file
    sed -i "s/foreground = white/foreground = black/" $temp_xava_file
    # Update the file's timestamp
    cat "$temp_xava_file" >"$xava_file"

    sed -i "s/theme=.*/theme=0/g" $config_file
    sed -i "2s/${theme[1]}/${theme[0]}/g" $lib_file
    sed -i "4s/${theme[0]}/${theme[1]}/g" $lib_file

elif [ "$1" = "light" ]; then
    # Xava file
    sed -i "s/foreground = black/foreground = white/" $temp_xava_file
    # Update the file's timestamp
    cat "$temp_xava_file" >"$xava_file"

    sed -i "s/theme=.*/theme=1/g" $config_file
    sed -i "2s/${theme[0]}/${theme[1]}/g" $lib_file
    sed -i "4s/${theme[1]}/${theme[0]}/g" $lib_file

elif [ "$1" = "default" ]; then
    theme=$(grep -oP 'theme=\K\w+' $config_file)
    echo "$theme"
fi

# Refresh layout blur for notification bar
bash $HOME/.config/eww/custom-layer.sh
