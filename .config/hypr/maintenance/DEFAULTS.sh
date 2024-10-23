restore_defaults() {
    if [ ! -f "$2" ]; then
        cp "$1" "$2"
    fi
}

echo "Setting up default configuration files..."

restore_defaults $HOME/.config/hypr/configs/defaults/exec.conf $HOME/.config/hypr/configs/custom/exec.conf

echo "Default configuration files are set up."
