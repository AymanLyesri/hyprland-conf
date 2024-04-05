#!/bin/bash
# Take a screenshot of all monitors
# Requires: imagemagick
# Usage: screenshot_all.sh [output_dir]
# output_dir: Directory to save the screenshots

ScreenshotsDir="$HOME/Pictures/WorkspaceShots"
screenshots=()

# active workspaces
workspace_ids=()
while IFS= read -r line; do
    id=$(echo "$line" | awk '{print $3}')
    if [[ $id =~ ^[0-9]+$ ]]; then
        workspace_ids+=("$id")
    fi
done < <(hyprctl workspaces | grep '^workspace ID' | sort -n)

hyprctl dispatch workspace 11

# create directory if not exists
mkdir -p "$ScreenshotsDir"

# take screenshots
for id in "${workspace_ids[@]}"; do
    hyprctl dispatch workspace "$id"
    sleep 2
    file="$ScreenshotsDir/$(date +'%s_grim.png')"
    $HOME/.config/hypr/scripts/screenshot.sh --now "$file" && screenshots+=("$file")
done

# Reorder the screenshots array to append the first screenshot (0) as the last one (10)
screenshots=("${screenshots[@]:1}" "${screenshots[0]}")

# merge screenshots
convert -append ${screenshots[@]} $ScreenshotsDir/$(date +'%s_grim_result.jpg')
