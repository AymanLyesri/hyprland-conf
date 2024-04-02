#!/bin/bash

light=$(light -G 2>/dev/null)

# Get current brightness
if [ "$light" ]; then
    echo ${light%.*}
else
    echo 1.0
fi
