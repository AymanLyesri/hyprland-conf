#!/bin/bash

# Get the directory where the script is located
# MAINTENANCE_DIR=$(dirname $(realpath $BASH_SOURCE))
# CONF_DIR=$(dirname $(dirname $(dirname $MAINTENANCE_DIR)))

# specify the repo branch
if [ -z "$1" ]; then
    BRANCH="dev"
else
    BRANCH=$1
fi

CONF_DIR="hyprland-conf"

if [ -d "$CONF_DIR" ]; then
    echo "$CONF_DIR directory exists."
else
    echo "$CONF_DIR directory does not exist. Cloning the repository..."
    git clone https://github.com/AymanLyesri/hyprland-conf.git --depth 1
fi

# Change branch
cd $CONF_DIR
git checkout $BRANCH

MAINTENANCE_DIR=".config/hypr/maintenance"

source $MAINTENANCE_DIR/ESSENTIALS.sh

# Install the required packages

install_git

install_fzf

install_figlet

install_yay


# # Backup dotfiles
echo "Backing up dotfiles from .config ..."
continue_prompt "backup" $MAINTENANCE_DIR/BACKUP.sh

continue_prompt "keyboard configuration" $MAINTENANCE_DIR/CONFIGURE.sh

sudo cp -a . $HOME
echo "Configuration files have been copied to $HOME."

# remove_packages
echo "Removing unwanted packages..."
remove_packages
echo "Unwanted packages have been removed."

# Install packages
echo "Installing packages..."
$HOME/.config/hypr/pacman/install-pkgs.sh yay

echo "Installation complete. Please Reboot the system."

# reboot
