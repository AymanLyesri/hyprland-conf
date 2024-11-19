#!/bin/bash

# This script is used to show the bandwidth usage of a given interface

# Get the network interface associated with Ethernet (enp)
interface=$(ip -o link show up | awk '/state UP/ {print substr($2, 1, length($2)-1); exit}')

# Function to extract bytes from ip command output
get_bytes() {
    ip -s link show $interface | awk -v target="$1" '$0 ~ target {getline; print $1}'
}

# Get initial values
rx_old=$(get_bytes "RX")
tx_old=$(get_bytes "TX")

while true; do
    # Get new values
    rx_new=$(get_bytes "RX")
    tx_new=$(get_bytes "TX")

    # Calculate speed
    rx_speed=$((($rx_new - $rx_old) / 1024 / 3)) # KB per second
    tx_speed=$((($tx_new - $tx_old) / 1024))     # KB per second

    # Display results
    echo "[$tx_speed,$rx_speed]"

    # Update old values
    rx_old=$rx_new
    tx_old=$tx_new
    sleep 3
done
