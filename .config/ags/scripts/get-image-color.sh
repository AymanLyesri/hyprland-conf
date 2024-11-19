#!/bin/bash

# Get the dominant color of an image
color=$(
    magick $1 -scale 1x1! -alpha off -format '%[hex:p{0,0}]' info:
)

echo "#$color"
