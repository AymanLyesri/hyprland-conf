#!/bin/bash

old_workspaces=()

get_active() {

    workspace_ids=()
    while IFS= read -r line; do
        workspace_ids+=("$line")
    done < <(hyprctl workspaces | grep "ID " | awk '$3 >= 0 {print $3}' | sort -n)

    echo -n "["
    for ((i = 0; i < ${#workspace_ids[@]}; i++)); do
        echo -n "${workspace_ids[i]}"
        if ((i != ${#workspace_ids[@]} - 1)); then
            echo -n ", "
        fi
    done
    echo "]"
}
get_active
socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do
    if [ "$old_workspaces" != "$(get_active)" ]; then
        old_workspaces=$(get_active)
        get_active
    fi
done
