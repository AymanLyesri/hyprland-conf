layer_file="$HOME/.config/hypr/configs/custom/layer_rule.conf" # Path to the layerrule file

id=$(hyprctl layers | awk '/Layer level 2 \(top\)/{getline; sub(/:$/, "", $2); print $2}') # Get overlay (3rd level)

echo -e "layerrule=blur, address:0x$id" >$layer_file
