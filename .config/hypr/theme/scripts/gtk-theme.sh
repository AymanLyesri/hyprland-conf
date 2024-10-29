#!/bin/bash

hyprDir=$HOME/.config/hypr
current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

gsettings set org.gnome.desktop.interface gtk-theme WhiteSur-${current_theme^}

echo "GTK theme set to WhiteSur-$current_theme"
