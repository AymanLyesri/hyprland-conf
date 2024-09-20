#!/bin/bash

file="$HOME/Pictures/Screenshots/$(date +'%s_grim.png')"

#check if file argument is passed as second argument
if [[ "$2" ]]; then
	file=$2
	echo "File : $file"
fi

# notify and view screenshot
notify_cmd_shot="notify-send 'Clipboard' 'Screenshot taken and copied to clipboard.' --action=\"feh $file\":\"Display it\""
# echo $notify_cmd_shot

if [[ "$1" == "--now" ]]; then

	grim - | wl-copy && wl-paste >$file

	eval ${notify_cmd_shot}

elif [[ "$1" == "--area" ]]; then

	grim -g "$(slurp)" - | wl-copy && wl-paste >$file

	eval ${notify_cmd_shot}

else
	echo -e "Available Options : --now --area"
fi
