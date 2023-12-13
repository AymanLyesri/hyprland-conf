#!/bin/bash

# This script is used to show the bandwidth usage of a given interface

get_up() {
    bandwidth=$(sudo iftop -t -s 1 -n -N -i any | grep -E 'Total send rate' | awk '{print $4}')

    echo $bandwidth | sed 's/[^0-9]*//g' | awk '{printf "%.2f", $1 / 1024}'
}

case "$1" in
"--up")
    get_up
    ;;
"--down")
    # echo 1
    ;;
*) ;;
esac
