#!/bin/bash

# This script is used to show the bandwidth usage of a given interface

# Get the network interface associated with Ethernet (enp)
enp_interface=$(ip -o link show | awk '/^[0-9]+: enp/{print $2}' | cut -d':' -f1)

# Network interface name
interface="enp8s0" # Change this to your actual interface name

# Function to extract bytes from ip command output
get_bytes() {
    ip -s link show "$enp_interface" | awk '/'"$1"':/{getline; print $1}'
}

# Get initial values
rx_old=$(get_bytes "RX")
tx_old=$(get_bytes "TX")
sleep 1

while true; do
    # Get new values
    rx_new=$(get_bytes "RX")
    tx_new=$(get_bytes "TX")

    # Calculate speed
    rx_speed=$((($rx_new - $rx_old) / 1024)) # KB per second with two decimal places
    tx_speed=$((($tx_new - $tx_old) / 1024)) # KB per second with two decimal places

    # Display results
    echo "[$tx_speed,$rx_speed]"

    # Update old values
    rx_old=$rx_new
    tx_old=$tx_new
    sleep 1
done