#!/bin/bash
hyprDir=$HOME/.config/hypr                     # hypr directory
config=$hyprDir/hyprpaper/config/defaults.conf # config file

previous_workspace_id=0
current_wallpaper=""

workspace_position() {
    local previous=$1
    local current=$2
    if [ "$current" -lt "$previous" ]; then
        hyprctl keyword layerrule animation slide left,hyprpaper
        # hyprctl keyword layerrule animation slide right layersOut,hyprpaper
    else
        hyprctl keyword layerrule animation slide right,hyprpaper
        # hyprctl keyword layerrule animation slide left layersOut,hyprpaper
    fi
}

change_wallpaper() {
    # Cache the workspace ID to avoid redundant calls
    local workspace_id=$(hyprctl monitors | awk '/active/ {print $3}')

    # If workspace hasn't changed, skip the rest of the function
    if [ "$workspace_id" == "$previous_workspace_id" ]; then
        return
    fi

    # Get the wallpaper from the config only if needed
    local wallpaper=$(awk -F= -v wsid="w-$workspace_id" '$1 == wsid {print $2}' $config)

    # Check if wallpaper is valid and has changed
    if [ "$wallpaper" ] && [ "$wallpaper" != "$current_wallpaper" ]; then
        echo "$wallpaper" >"$hyprDir/hyprpaper/config/current.conf"

        # Kill the wallpaper script only if it's already running
        pgrep -f "$hyprDir/hyprpaper/w.sh" && killall w.sh

        # Run the wallpaper script with the new wallpaper
        $hyprDir/hyprpaper/w.sh "$wallpaper" &

        # Update current wallpaper and workspace ID
        current_wallpaper=$wallpaper
        previous_workspace_id=$workspace_id
    fi
}

# Initial wallpaper setup
change_wallpaper

# Listen to workspace changes via Hyprland socket
socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do
    change_wallpaper
done
