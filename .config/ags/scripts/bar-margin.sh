#!/bin/bash
if [ $(hyprctl activewindow) == 'Invalid' ]; then
    echo 10 #in pixels
else
    echo 0 #in pixels
fi
