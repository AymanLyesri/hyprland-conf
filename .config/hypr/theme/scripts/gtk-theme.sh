#!/bin/bash

hyprDir=$HOME/.config/hypr
current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

gsettings set org.gnome.desktop.interface gtk-theme Adwaita-$current_theme

gsettings set org.gnome.desktop.interface cursor-theme phinger-cursors-$current_theme
