customDir="$HOME/.config/hypr/configs/custom"
defaultsDir="$HOME/.config/hypr/configs/defaults"

# restore_defaults() {
#     if [ ! -f "$2" ]; then
#         cp "$1" "$2"
#     fi
# }

echo "Setting up default configuration files..."

cp $defaultsDir/* $customDir

echo " Done."
