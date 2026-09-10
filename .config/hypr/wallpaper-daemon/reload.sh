#!/bin/bash
BIN_DIR=/tmp
SRC=$HOME/.config/hypr/scripts-c
hyprDir=$HOME/.config/hypr # hypr directory
BIN="$BIN_DIR/wallpaper-loop"
SRC_FILE="$SRC/wallpaper-loop.c"

# Restart wallpaper-loop without killing hyprpaper (avoids flicker + full re-set).
# Only recompile when the source is newer than the binary.
if [ ! -x "$BIN" ] || [ "$SRC_FILE" -nt "$BIN" ]; then
    echo "Compiling wallpaper-loop..."
    if ! gcc "$SRC_FILE" -o "$BIN"; then
        echo "Compile failed" >&2
        exit 1
    fi
else
    echo "Binary up to date, skipping compile."
fi

# Stop old daemon instances only (leave hyprpaper running).
# NOTE: exact-name match (-x), never -f "wallpaper-loop": a full-cmdline
# match would also kill the shell running this script when its own
# command line contains the pattern (e.g. invoked via `bash -c ...`).
pkill -x "wallpaper-loop" 2>/dev/null
sleep 0.3

nohup "$BIN" > /dev/null 2>&1 &
disown
