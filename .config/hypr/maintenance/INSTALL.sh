#!/bin/bash

# Get the directory where the script is located
MAINTENANCE_DIR=$(dirname $(realpath $BASH_SOURCE))
CONF_DIR=$(dirname $(dirname $(dirname $MAINTENANCE_DIR)))

source $MAINTENANCE_DIR/ESSENTIALS.sh

continue_prompt() {
    # Color variables
    GREEN="\e[32m"
    RED="\e[31m"
    CYAN="\e[36m"
    BOLD="\e[1m"
    RESET="\e[0m"
    
    while true; do
        echo -e "${CYAN}${BOLD}Would you like to proceed $1?${RESET} ${GREEN}[Y]${RESET}/${RED}[N]${RESET}: "
        read -p "" choice
        case "$choice" in
            [Yy]* ) echo -e "${GREEN}Great! Continuing $1...${RESET}";
                bash $2;
            break;;
            [Nn]* ) echo -e "${RED}Okay, exiting $1...${RESET}";
            exit;;
            * ) echo -e "${RED}Please answer with Y or N.${RESET}";;
        esac
    done
}

install_fzf

install_figlet

install_yay


# # Backup dotfiles
echo "Backing up dotfiles from .config ..."
continue_prompt "backup" $MAINTENANCE_DIR/BACKUP.sh

continue_prompt "keyboard configuration" $MAINTENANCE_DIR/CONFIGURE.sh

sudo cp -a $CONF_DIR/. $HOME
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
