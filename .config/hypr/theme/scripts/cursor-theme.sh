#!/bin/bash

hyprDir=$HOME/.config/hypr
current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

hyprctl setcursor theme_phinger-cursors-$current_theme 24
