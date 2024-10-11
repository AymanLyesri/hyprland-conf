# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

install_fzf() {
    if command_exists fzf; then
        echo "fzf is already installed."
    else
        echo "fzf is not installed. Installing fzf..."
        
        # Clone fzf repository from GitHub
        sudo pacman -S fzf
    fi
}

install_figlet() {
    if command_exists figlet; then
        echo "figlet is already installed."
    else
        echo "figlet is not installed. Installing figlet..."
        # Install figlet
        sudo pacman -S figlet
    fi
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
