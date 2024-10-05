#!/bin/bash

# Run hostnamectl and filter output for Chassis information
# chassis_type=$(hostnamectl | grep "Chassis:" | awk '/Chassis/{print $2}')
resolution=$(xrandr | grep '*' | awk '{print $1}')

sens_file="$HOME/.config/hypr/configs/custom/sensitivity.conf"        # Path to the sensitivity file
gap_file="$HOME/.config/hypr/configs/custom/gaps.conf"                # Path to the gaps file
border_size_file="$HOME/.config/hypr/configs/custom/border_size.conf" # Path to the border size file
blur_file="$HOME/.config/hypr/configs/custom/blur.conf"               # Path to the blur file

touch -c $sens_file $gap_file $border_size_file $blur_file # Create the files if they don't exist

if [ $chassis_type == "1366×768" ]; then
    sensitivity="0.4"     # Sensitivity for the touchpad
    gaps_in="5"           # Inner Gaps for the windows
    gaps_out="5,10,10,10" # Outer Gaps for the windows, top, right, bottom, left
    border_size="1"       # Border size for the windows
    size="6"              # Size of the blur
    passes="2"            # Number of passes for the blur
else
    sensitivity="0.2"     # Sensitivity for the mouse
    gaps_in="7"           # Inner Gaps for the windows
    gaps_out="5,15,15,15" # Outer Gaps for the windows, top, right, bottom, left
    border_size="2"       # Border size for the windows
    size="2"              # Size of the blur
    passes="4"            # Number of passes for the blur
fi

# echo -e "general { \n\tsensitivity=$sensitivity \n}" >$sens_file                              # Write the sensitivity to the file
echo -e "general { \n\tgaps_in=$gaps_in \n\tgaps_out=$gaps_out \n}" >$gap_file                # Write the gaps to the file
echo -e "decoration { \n\tblur { \n\t\tsize=$size \n\t\tpasses=$passes \n\t} \n}" >$blur_file # Write the blur to the file
# echo -e "general { \n\tborder_size=$border_size \n}" >$border_size_file                       # Write the border size to the file
