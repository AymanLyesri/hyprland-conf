#!/bin/bash
# Theme css file
css_file="$HOME/.cache/wal/colors.css"

# Border config file
border_file="$HOME/.config/hypr/configs/custom/border.conf"

# Extract hex color codes from CSS file and store them in an array
colors=($(grep -o '#[0-9A-Fa-f]\{6\}' $css_file | sed 's/^#//'))

# Display all colors in the array
echo "${colors[@]}"

# Define the new string
new_colors="rgb(${colors[4]}) rgb(${colors[0]}) rgb(${colors[0]}) rgb(${colors[4]}) 270deg"

# Use sed to replace the entire string after '=' with the new string
sed -i "s/col.active_border = .*/col.active_border = $new_colors/" $border_file
