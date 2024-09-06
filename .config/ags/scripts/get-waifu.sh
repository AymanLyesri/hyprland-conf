#!/bin/bash

# Check if id parameter is passed
if [ -z "$1" ]; then
    ID="random"
else
    ID=$1
fi

# Variables
API_URL="https://danbooru.donmai.us/posts/$ID.json?tags=breasts&-rating=explicit" # API URL to fetch a random post
API_KEY="tYWBHV2Pv5dKKmRBsQaMHtFH"                                                # Replace with your own API key
USER_NAME="lilayman"                                                              # Replace with your own username
SAVE_DIR="$HOME/.config/ags/assets/images"                                        # Directory where the image will be saved
image_name="waifu.jpg"

# Create the directory if it doesn't exist
mkdir -p "$SAVE_DIR"

# Fetch the random post
response=$(curl -s -H "Authorization: Basic $(echo -n "$USER_NAME:$API_KEY" | base64)" "$API_URL")

# Check if the response contains the image URL
image_url=$(echo "$response" | grep -oP '"file_url":\s*"\K[^"]+')

# Full path to save the image
image_path="$SAVE_DIR/$image_name"

# Download the image
curl -s -o "$image_path" "$image_url"

# Check if the download was successful
if [ -f "$image_path" ]; then
    # echo "[\"$image_post_url\", \"$image_height\", \"$image_width\"]"
    cat "$SAVE_DIR/waifu.json" >"$SAVE_DIR/previous.json"
    echo $response >"$SAVE_DIR/waifu.json"
else
    echo "Failed to download the image."
fi
