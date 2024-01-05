#!/bin/bash

if [[ ! $(pgrep -f blueman-manager) ]]; then
    blueman-manager
else
    killall blueman-manager
fi
