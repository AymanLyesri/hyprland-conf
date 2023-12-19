#!/bin/bash
if [ $(hyprctl activewindow) == 'Invalid' ]; then
    echo 20 #in pixels
else
    echo 5 #in pixels
fi