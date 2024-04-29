#!/bin/bash

while true; do
    # Get battery percentage
    battery_percentage=$(upower -i /org/freedesktop/UPower/devices/battery_BAT1 | grep -E "percentage" | awk '{print $2}')

    # Remove the % sign
    battery_percentage=${battery_percentage%\%}

    # Check if battery level is less than or equal to 25%
    if [ $battery_percentage -le 25 ] && [ $battery_percentage -ne 0 ]; then
        # Send alert notification every 1 second until charging
        while true; do
            # Send alert notification
            notify-send -u critical "Battery Low!" "Battery level is at $battery_percentage%. Please plug in your charger."

            # Get charging status
            charging_status=$(upower -i /org/freedesktop/UPower/devices/battery_BAT1 | grep -E "state" | awk '{print $2}')

            # Check if charging
            if [ "$charging_status" = "charging" ]; then
                break # Exit the inner loop if charging
            fi

            # Sleep for 1 second before sending the next notification
            sleep 10
        done
    fi

    # Sleep for 5 minutes before checking battery level again
    sleep 600 # 300 seconds = 5 minutes
done
