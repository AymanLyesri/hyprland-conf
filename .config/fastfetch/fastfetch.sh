#!/bin/bash
# Path to the image file
IMAGE_PATH="$HOME/.config/ags/assets/terminal/icon.jpg"

if [ ! -f "$IMAGE_PATH" ]; then
    FETCH="fastfetch --logo-padding 1 --logo-padding-top 0 --logo $HOME/.config/ags/assets/terminal/icon.jpg"
    eval "$FETCH"
    return 0
fi

# Get the image dimensions
DIMENSIONS=$(identify -format "%wx%h" "$IMAGE_PATH")

# Extract width and height
WIDTH=$(echo "$DIMENSIONS" | cut -d'x' -f1)
HEIGHT=$(echo "$DIMENSIONS" | cut -d'x' -f2)

# Calculate the aspect ratio
RATIO=$(echo "scale=2; $WIDTH/$HEIGHT" | bc)

ARGUMENTS=""

# Determine fetch arguments based on ratio
if (($(echo "$RATIO >= 1" | bc -l))); then
    ARGUMENTS="--logo-width $(echo "$COLUMNS / 2.5" | bc)"
else
    ARGUMENTS="--logo-height 21"
fi

# Fetch system information with adjusted logo size
FETCH="fastfetch --logo-recache $ARGUMENTS --logo $HOME/.config/ags/assets/terminal/icon.jpg"
eval "$FETCH"
