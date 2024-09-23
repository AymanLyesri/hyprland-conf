#!/bin/bash

# Path to the file containing the list of packages
package_list="$HOME/.config/hypr/pacman/pkglist.txt"

temp_file=$(mktemp)  # Create a temporary file to store packages to keep

# Loop through each package in the file
while read -r package; do
    # Check if the package is installed
    if ! pacman -Qi "$package" &> /dev/null; then
        # Ask user for confirmation before removing the package
        read -p "Package $package is not installed. Do you want to remove it? (y/n): " choice </dev/tty
        if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
            echo "Removing $package..."
            yay -Rns "$package"
        else
            echo "Skipping $package..."
            echo "$package" >> "$temp_file"  # Add the package to the temp file if not removed
        fi
    else
        # If the package is installed, add it to the temp file
        echo "$package" >> "$temp_file"
    fi
done < "$package_list"

# Overwrite the original file with the temp file
mv "$temp_file" "$package_list"