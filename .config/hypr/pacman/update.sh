#!/bin/bash

grep -vE '^\s*#|^\s*$' $HOME/.config/hypr/pacman/pkglist.txt | yay -S -
