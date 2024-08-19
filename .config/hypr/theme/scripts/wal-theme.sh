#!/bin/bash

hyprDir=$HOME/.config/hypr
current_wallpaper=$(cat $hyprDir/hyprpaper/config/current.conf)

current_theme=$(bash $hyprDir/theme/scripts/system-theme.sh get)

# check if $1 is provided
if [ $1 ]; then
    current_wallpaper=$1
fi

killall wal # kill pywal.sh

if [ "$current_theme" = "dark" ]; then

    wal -e -n -i $current_wallpaper &

elif [ "$current_theme" = "light" ]; then

    wal -e -n -i $current_wallpaper -l &

fi

#!/bin/bash
# killall wal # kill pywal.sh

# random=$1

# wal -e -n -i "$random" # set wallpaper theme

#   -h, --help            show this help message and exit
#   -a "alpha"            Set terminal background transparency. *Only
#                         works in URxvt*
#   -b background         Custom background color to use.
#   --backend [backend]   Which color backend to use. Use 'wal --backend'
#                         to list backends.
#   --theme [/path/to/file or theme_name], -f [/path/to/file or theme_name]
#                         Which colorscheme file to use. Use 'wal --theme'
#                         to list builtin themes.
#   --iterative           When pywal is given a directory as input and
#                         this flag is used: Go through the images in
#                         order instead of shuffled.
#   --saturate 0.0-1.0    Set the color saturation.
#   --preview             Print the current color palette.
#   --vte                 Fix text-artifacts printed in VTE terminals.
#   -c                    Delete all cached colorschemes.
#   -i "/path/to/img.jpg"
#                         Which image or directory to use.
#   -l                    Generate a light colorscheme.
#   -n                    Skip setting the wallpaper.
#   -o "script_name"      External script to run after "wal".
#   -q                    Quiet mode, don't print anything.
#   -r                    'wal -r' is deprecated: Use (cat
#                         ~/.cache/wal/sequences &) instead.
#   -R                    Restore previous colorscheme.
#   -s                    Skip changing colors in terminals.
#   -t                    Skip changing colors in tty.
#   -v                    Print "wal" version.
#   -e                    Skip reloading gtk/xrdb/i3/sway/polybar
