#!/bin/bash

# hyprpaper &

# random=$(find /home/ayman/.config/hypr/wallpapers -type f | shuf -n 1)

# for x in {0..69}
# do
#     preload=$(hyprctl hyprpaper preload $random)
#     hyprctl hyprpaper wallpaper "eDP-1,"$random
#     hyprctl hyprpaper unload $random
#     [[ $preload != "ok" ]] || break
#     sleep 0.1
# done

# hyprctl hyprpaper unload all

random=$(find /home/ayman/.config/hypr/wallpapers -type f | shuf -n 1)
config=/home/ayman/.config/hypr/hyprpaper.conf

> $config

for wallpaper in $(find /home/ayman/.config/hypr/wallpapers/ -type f)
do   
    echo "preload = $wallpaper" >> $config
done

echo "" >> $config
echo "wallpaper = eDP-1,$random" >> $config
