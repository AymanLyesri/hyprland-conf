#!/bin/bash

file="$HOME/Pictures/Screenshots/$(date +'%s_grim.png')"

#check if file argument is passed as second argument
if [[ "$2" ]]; then
	file=$2
	echo "File : $file"
fi

# notify and view screenshot

if [[ "$1" == "--now" ]]; then

	grim - | wl-copy && wl-paste >$file

	notify-send 'Clipboard' 'Screenshot taken and copied to clipboard.' --hint=string:actions:"[[\"Preview\",\"feh $file \"],[\"Edit\",\"gimp $file \"],[\"Delete\",\"rm $file \"]]"

elif [[ "$1" == "--area" ]]; then

	grim -g "$(slurp)" - | wl-copy && wl-paste >$file

	notify-send 'Clipboard' 'Screenshot taken and copied to clipboard.' --hint=string:actions:"[[\"Preview\",\"feh $file \"],[\"Edit\",\"gimp $file \"],[\"Delete\",\"rm $file \"]]"

else
	echo -e "Available Options : --now --area"
fi
