#!/bin/bash

# Directory containing images
input_directory="$HOME/.config/wallpapers/normal"  # Change to your directory path
output_directory="$HOME/.config/wallpapers/compressed"  # Change to your desired output path
target_size=$((2 * 1024 * 1024))  # Target size in bytes (2MB)

# Create the output directory if it doesn't exist
mkdir -p "$output_directory"

# Loop through each image file in the directory
shopt -s nullglob  # Prevents the loop from running if no files match
for input_image in "$input_directory"/*; do
    # Check if the file is an image (JPG or PNG)
    if [[ $input_image =~ \.(jpg|jpeg|png)$ ]]; then
        # Extract the filename
        filename=$(basename "$input_image")
        output_image="$output_directory/$filename"
        
        # Get the current size of the input image
        current_size=$(stat -c%s "$input_image")
        
        # Check if the file size is already smaller than the target size
        if [ $current_size -le $target_size ]; then
            echo "Skipping: $filename (already smaller than target size)"
            cp "$input_image" "$output_image"  # Copy to output directory
            continue
        fi
        
        # If it's a PNG, optimize it instead of changing quality
        if [[ $input_image =~ \.png$ ]]; then
            # Optimize the PNG image
            magick "$input_image" -resize 1920x1080 -strip -quality 100 -define png:compression-level=9 "$output_image"
            new_size=$(stat -c%s "$output_image")
            echo "Processed PNG: $filename - Size: $new_size bytes (target: $target_size bytes)"
        else
            # For JPG images, adjust quality
            quality=100
            while true; do
                magick "$input_image" -resize 1920x1080 -quality $quality "$output_image"
                new_size=$(stat -c%s "$output_image")
                
                # Check if the file size is less than or equal to the target size
                if [ $new_size -le $target_size ]; then
                    echo "Processed JPG: $filename - Size: $new_size bytes (target: $target_size bytes)"
                    break
                fi
                
                # Reduce the quality by 1%
                quality=$((quality - 1))
                
                # Break the loop if quality is too low
                if [ $quality -le 10 ]; then
                    echo "Unable to reduce file size below target for $filename with acceptable quality=$quality. Skipping."
                    break
                fi
            done
        fi
    fi
done
