#!/bin/bash
if [ $(hyprctl activewindow) == 'Invalid' ]; then
    echo 35 #in pixels
else
    echo 25
fi
