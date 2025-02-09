echo "Checking if a color scheme is already present"

sudo [ -d "$HOME/.cache/wal" ] || wal -i "$(find ~/.config/wallpapers/default -type f | head -n 1)"
