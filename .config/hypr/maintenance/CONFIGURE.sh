# #!/bin/bash

GENERAL_CONF_FILE="$HOME/.config/hypr/configs/general.conf"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

install_fzf() {
    if command_exists fzf; then
        echo "fzf is already installed."
    else
        echo "fzf is not installed. Installing fzf..."
        
        # Clone fzf repository from GitHub
        sudo pacman -S fzf
    fi
}

install_figlet() {
    if command_exists figlet; then
        echo "figlet is already installed."
    else
        echo "figlet is not installed. Installing figlet..."
        # Install figlet
        sudo pacman -S figlet
    fi
}

configure_keybord() {
    figlet "Keyboard"
    
    # List of keyboard layouts
    kb_layouts=$(localectl list-x11-keymap-layouts)
    kb_variants=$(localectl list-x11-keymap-variants)
    
    echo "Configuring keyboard layout for hyprland... (eg: us, es, fr, de, etc)"
    new_layout=$(echo "$kb_layouts" | fzf --height 40%)
    # Check if the selection was canceled
    if [ -z "$new_layout" ]; then
        echo "No layout selected. Defaulting to 'us'."
        new_layout="us"
    else
        echo "Keyboard layout has been configured to: $new_layout"
    fi
    sed -i "s/kb_layout=.*/kb_layout=$new_layout,$new_layout/" "$GENERAL_CONF_FILE"
    
    
    echo "Configuring keyboard variant for hyprland... (eg: intl, dvorak, etc)"
    new_variant=$(echo "$kb_variants" | fzf --height 40%)
    # Check if the selection was canceled
    if [ -z "$new_variant" ]; then
        echo "No variant selected. Leaving it empty."
    else
        echo "Keyboard variant has been configured to: $new_variant"
    fi
    sed -i "s/kb_variant=.*/kb_variant=$new_variant,/" "$GENERAL_CONF_FILE"
}

install_fzf

install_figlet

configure_keybord




