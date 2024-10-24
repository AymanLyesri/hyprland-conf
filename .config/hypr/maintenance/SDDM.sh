#!/bin/bash

# Disable lightdm and GDM
echo "Disabling lightdm and GDM... (dont worry about the error messages)"
sudo systemctl disable lightdm.service
sudo systemctl disable gdm.service
echo " Done."

# Enable sddm
echo "Enabling sddm..."
sudo systemctl enable sddm
echo " Done."

# Sddm theme setup
echo "Setting up sddm theme..."
sudo mkdir -p /etc/sddm.conf.d
echo -e "[Theme]\nCurrent=where_is_my_sddm_theme" | sudo tee /etc/sddm.conf.d/theme.conf >/dev/null
echo " Done."

# /usr/share/backgrounds permission
sudo chmod 777 -R /usr/share/backgrounds

echo "Sddm Configuration complete."
