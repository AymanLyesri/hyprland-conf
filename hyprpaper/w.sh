#!/bin/bash
# random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1) # get random wallpaper
# random="$(echo '/home/ayman/.config/hypr/wallpapers/normal/yande.re 826221 ass bikini breast_hold feet mitsu_(mitsu_art) natsuki_subaru ram_(re_zero) re_zero_kara_hajimeru_isekai_seikatsu rem_(re_zero) swimsuits topless.jpg')"
monitors=$(hyprctl monitors | grep Monitor | awk '{print $2}') # get monitors
hyprdir=$HOME/.config/hypr

wallpaper=$1

##########################################

source $hyprdir/wal/pywal "$wallpaper"         # set wallpaper theme
source $hyprdir/scripts/dynamic-border.sh & # set border theme

##########################################

source $hyprdir/scripts/eww_reset & # reset eww

##########################################

hyprctl hyprpaper preload "$wallpaper" # preload wallpaper

for monitor in $monitors; do                       # loop through monitors
    hyprctl hyprpaper wallpaper "$monitor,$wallpaper" # set wallpaper
done

hyprctl hyprpaper unload all # unload wallpaper
