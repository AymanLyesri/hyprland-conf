#!/bin/bash

hyprDir=$HOME/.config/hypr
rofiDir=$HOME/.config/rofi

current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)
rofi_config=$rofiDir/launchers/type-7/style-7.rasi

if [ "$current_theme" = "dark" ]; then
    # Replace the background color
    sed -i 's/background:.*;/background: #000000;/' $rofi_config

    # Replace the background-alt color
    sed -i 's/background-alt:.*;/background-alt: #010101;/' $rofi_config

    # Replace the foreground color
    sed -i 's/foreground:.*;/foreground: #f2f2f2;/' $rofi_config

elif [ "$current_theme" = "light" ]; then

    # Replace the background color
    sed -i 's/background:.*;/background: #f2f2f2;/' $rofi_config

    # Replace the background-alt color
    sed -i 's/background-alt:.*;/background-alt: #e0e0e0;/' $rofi_config

    # Replace the foreground color
    sed -i 's/foreground:.*;/foreground: #000000;/' $rofi_config
else
    echo "Invalid theme"
    exit 1

fi
