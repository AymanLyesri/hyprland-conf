#!/bin/bash

hyprDir=$HOME/.config/hypr

theme_conf=$hyprDir/theme/theme.conf

if [ ! -f $theme_conf ]; then
    echo "theme=dark" >$theme_conf
fi

#check for $1

if [ -z $1 ]; then
    echo "No argument provided: get or switch"
    exit 1
fi

current_theme=$(grep '^theme=' $theme_conf | cut -d'=' -f2)

if [ $1 == "get" ]; then
    echo $current_theme
    exit 0
elif
    [ $1 == "switch" ]
then
    if [ -z $2 ]; then
        echo "No argument provided: dark or light"
        if [ "$current_theme" == "dark" ]; then
            sed -i 's/^theme=dark$/theme=light/' "$theme_conf"
        elif [ "$current_theme" == "light" ]; then
            sed -i 's/^theme=light$/theme=dark/' "$theme_conf"
        else
            echo "Current theme is neither 'dark' nor 'light'."
        fi
        exit 0
    fi

    if [ $2 == "dark" ]; then
        sed -i 's/^theme=light$/theme=dark/' "$theme_conf"
    elif [ $2 == "light" ]; then
        sed -i 's/^theme=dark$/theme=light/' "$theme_conf"
    else
        echo "Invalid argument"
        exit 1
    fi
    exit 0
else
    echo "Invalid argument"
    exit 1
fi
