#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR=$(dirname $(realpath $BASH_SOURCE))
CONF_DIR=$(dirname $(dirname $(dirname $SCRIPT_DIR)))

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install yay
install_yay() {
    if command_exists yay; then
        echo "yay is already installed."
    else
        echo "yay is not installed. Installing yay..."
        
        # Update system packages
        sudo pacman -Syu --noconfirm
        
        # Install base-devel and git if not already installed
        sudo pacman -S --needed --noconfirm base-devel git
        
        # Clone yay repository from the AUR
        git clone https://aur.archlinux.org/yay.git
        
        # Change directory to yay folder
        cd yay
        
        # Build and install yay
        makepkg -si --noconfirm
        
        # Go back to the original directory
        cd ..
        
        # Clean up by removing the yay directory
        rm -rf yay
        
        echo "yay has been successfully installed."
    fi
}

# Function to remove certain packages
remove_packages() {
    # List of packages to remove (space-separated)
    packages_to_remove=("dunst")  # Replace with actual package names
    
    # Check if packages are installed and remove them
    if pacman -Q "${packages_to_remove[@]}" &>/dev/null; then
        echo "Removing packages: ${packages_to_remove[*]}"
        killall ${packages_to_remove[@]} 2>/dev/null
        sudo pacman -Rns --noconfirm "${packages_to_remove[@]}"
    else
        echo "One or more packages are not installed."
    fi
}


sudo cp -a $CONF_DIR/. $HOME
echo "Configuration files have been copied to $HOME."

# Install yay
echo "Installing yay..."
install_yay
echo "yay is installed."

# remove_packages
echo "Removing unwanted packages..."
remove_packages
echo "Unwanted packages have been removed."

# Install packages
echo "Installing packages..."
$HOME/.config/hypr/pacman/install-pkgs.sh yay
echo "Installation complete. Rebooting the system..."

# reboot
