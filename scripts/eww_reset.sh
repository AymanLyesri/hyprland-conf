#!/bin/bash

CONFIG="$HOME/.config/hypr/eww"
# STYLE="$HOME/.config/hypr/waybar/style.css"

eww --config ${CONFIG} kill

eww --config ${CONFIG} open bar



# --style ${STYLE}