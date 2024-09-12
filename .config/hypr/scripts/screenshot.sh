#!/bin/bash

file="$HOME/Pictures/Screenshots/$(date +'%s_grim.png')"

#check if file argument is passed as second argument
if [[ "$2" ]]; then
	file=$2
	echo "File : $file"
fi

# notify and view screenshot
notify_cmd_shot="notify-send -h string:x-canonical-private-synchronous:shot-notify -u low -i ${iDIR}/picture.png"

if [[ "$1" == "--now" ]]; then

	grim - | wl-copy && wl-paste >$file

	${notify_cmd_shot} "Copied to clipboard."

elif [[ "$1" == "--area" ]]; then

	grim -g "$(slurp)" - | wl-copy && wl-paste >$file

	${notify_cmd_shot} "Copied to clipboard."

else
	echo -e "Available Options : --now --area"
fi
