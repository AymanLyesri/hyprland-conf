#!/bin/bash
hyprDir=$HOME/.config/hypr # hypr directory

# killall hyprpaper
hyprctl hyprpaper unload all
killall auto.sh

$hyprDir/hyprpaper/load.sh
