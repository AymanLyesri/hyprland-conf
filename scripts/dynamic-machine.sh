#!/bin/bash

# Run hostnamectl and filter output for Chassis information
chassis_type=$(hostnamectl | grep "Chassis:" | awk '/Chassis/{print $2}')

sens_file="$HOME/.config/hypr/configs/custom/sensitivity.conf"
gap_file="$HOME/.config/hypr/configs/custom/gaps.conf"
border_size_file="$HOME/.config/hypr/configs/custom/border_size.conf"

if [ $chassis_type == "laptop" ]; then
    sensitivity="0.4"
    gaps_in="5"
    gaps_out="10"
    border_size="2"
else
    sensitivity="0.2"
    gaps_in="7"
    gaps_out="15"
    border_size="3"
fi

echo -e "general { \n\tsensitivity=$sensitivity \n}" >$sens_file
echo -e "general { \n\tgaps_in=$gaps_in \n\tgaps_out=$gaps_out \n}" >$gap_file
echo -e "general { \n\tborder_size=$border_size \n}" >$border_size_file
