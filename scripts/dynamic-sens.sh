#!/bin/bash

# Run hostnamectl and filter output for Chassis information
chassis_type=$(hostnamectl | grep "Chassis:" | awk '/Chassis/{print $2}')
sens_file="$HOME/.config/hypr/configs/general.conf"

if [ $chassis_type == "laptop" ]; then
    new_sensitivity="0.4"
else
    new_sensitivity="0.2"
fi

# Use sed to replace the sensitivity value in the file
sed -i "s/sensitivity=*.*/sensitivity=$new_sensitivity/g" $sens_file
