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
aur_helper=$(echo "${aur_helpers[@]}" | tr ' ' '\n' | fzf --height "40%")

continue_prompt "Do you want to install necessary packages? (using $aur_helper)" "$HOME/.config/hypr/pacman/install-pkgs.sh $aur_helper"
