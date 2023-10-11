#!/bin/bash

CONFIG="$HOME/.config/hypr/wofifull/config"
STYLE="$HOME/.config/hypr/wofifull/style.css"
COLORS="$HOME/.config/hypr/wofifull/colors"

if [[ ! $(pidof wofi) ]]; then
	wofi --show drun --prompt 'Search...' --conf ${CONFIG} --style ${STYLE} --color ${COLORS}
else
	pkill wofi
fi
