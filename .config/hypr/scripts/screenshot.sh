#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
screenshot_dir="$HOME/Pictures/Screenshots"
screenshot_fullscreen_dir="$screenshot_dir/fullscreen"
screenshot_area_dir="$screenshot_dir/area"

# create screenshot directory if it doesn't exist
mkdir -p "$screenshot_dir"
mkdir -p "$screenshot_fullscreen_dir"
mkdir -p "$screenshot_area_dir"

# check if file argument is passed as second argument
if [[ "$2" ]]; then
    file=$2
    echo "File : $file"
fi

# notify and view screenshot

if [[ "$1" == "--now" ]]; then
    img="$screenshot_fullscreen_dir/screenshot_$timestamp.png"
    # Full output (PNG: Qt/Quickshell has no webp plugin, so PNG is
    # required for the notification preview and a correct image/png paste)
    grimblast --freeze save screen "$img" || exit 1

    elif [[ "$1" == "--area" ]]; then
    img="$screenshot_area_dir/screenshot_area_$timestamp.png"
    # Select region (non-zero exit = user cancelled, stay silent)
    grimblast --freeze save area "$img" || exit 1

else

    echo -e "Available Options : --now --area --all"
    exit 1
fi

# Optimize PNG lossless (skip silently if ImageMagick is missing)
if command -v magick >/dev/null 2>&1; then
    magick "$img" -strip -define png:compression-level=6 "$img"
fi

# Send image to clipboard (bytes must match the declared MIME type)
wl-copy --type image/png < "$img"

# Notify user (quoted icon path so it arrives as a loadable file URL)
notify-send -a "Screenshot" -i "$img" "Screenshot saved" "Saved and copied to clipboard"
