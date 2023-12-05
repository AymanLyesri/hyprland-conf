#!/bin/bash

# Run hostnamectl and filter output for Chassis information
chassis_type=$(hostnamectl | grep "Chassis:" | awk '/Chassis/{print $2}')
sens_file="$HOME/.config/hypr/configs/general.conf"

echo "Chassis type: $chassis_type"

if [ $chassis_type == "laptop" ]; then
    new_sensitivity="0.3"
    echo "Laptop detected, setting sensitivity to $new_sensitivity"
else
    new_sensitivity="0.2"
    # echo "Desktop detected, setting sensitivity to $new_sensitivity"
fi

# Use sed to replace the sensitivity value in the file
sed -i "s/sensitivity=/sensitivity=$new_sensitivity/g" $sens_file
