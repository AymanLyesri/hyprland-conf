#!/bin/bash

# Disable SDDM and GDM
echo "Disabling SDDM and GDM... (dont worry about the error messages)"
sudo systemctl disable sddm.service
sudo systemctl disable gdm.service
echo " Done."

# Uninstall SDDM and GDM
echo "Uninstalling SDDM and GDM... (dont worry about the error messages)"
sudo pacman -Rns sddm gdm
echo " Done."

# Enable LightDM
echo "Enabling LightDM..."
sudo systemctl enable lightdm.service
echo " Done."

echo "Configuring LightDM Webkit2 Greeter..."
# echo "greeter-session=lightdm-webkit2-greeter" into /etc/lightdm/lightdm.conf
sudo sed -i 's/^#\?greeter-session=.*/greeter-session=lightdm-webkit2-greeter/' /etc/lightdm/lightdm.conf
echo " Done."

echo "Setting LightDM Webkit2 Greeter theme to litarvan..."
# edit /etc/lightdm/lightdm-webkit2-greeter.conf and set theme or webkit-theme to litarvan (original: webkit_theme        = antergos)
sudo sed -i 's/^#\?webkit_theme.*/webkit_theme = litarvan/' /etc/lightdm/lightdm-webkit2-greeter.conf
echo " Done."

# /usr/share/backgrounds permission
sudo chmod 777 -R /usr/share/backgrounds

echo "LightDM Configuration complete."
