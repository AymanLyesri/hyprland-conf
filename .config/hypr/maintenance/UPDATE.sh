#!/bin/bash

figlet "Updating Config"

source $HOME/.config/hypr/maintenance/ESSENTIALS.sh # source the essentials file INSIDE the repository

# specify the repo branch
if [ -z "$1" ]; then
    BRANCH="master"
else
    BRANCH=$1
fi

git checkout $BRANCH
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

aur_helpers=("yay" "paru")

for helper in "${aur_helpers[@]}"; do
    if command -v "$helper" &>/dev/null; then
        aur_helper="$helper"
        break
    fi
done

if [[ -z "$aur_helper" ]]; then
    echo "No AUR helper (yay or paru) is installed."
else
    continue_prompt "Do you want to install necessary packages? (using $aur_helper)" "$HOME/.config/hypr/pacman/install-pkgs.sh $aur_helper"
fi

continue_prompt "Do you want to set up default custom files" "$HOME/.config/hypr/maintenance/DEFAULTS.sh"
