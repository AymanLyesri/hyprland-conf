# Create the directory if it doesn't exist
mkdir -p $HOME/.config/rofi

# Symlink the config file
ln -f $HOME/.config/hypr/rofi/config.rasi $HOME/.config/rofi/config.rasi
