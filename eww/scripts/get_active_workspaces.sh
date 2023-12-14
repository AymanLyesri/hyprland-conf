#!/bin/bash

# ic=(0 一 二 三 四 五 六 七 八 九 〇)

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

socat -u UNIX-CONNECT:/tmp/hypr/"$HYPRLAND_INSTANCE_SIGNATURE"/.socket2.sock - | while read -r event; do
    get_active
done
