# #!/bin/bash

GENERAL_CONF_FILE="$HOME/.config/hypr/configs/general.conf"



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
configure_keybord




