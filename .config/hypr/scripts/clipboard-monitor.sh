#!/bin/bash

wl-paste --watch bash -c '
  # Wait for the clipboard to fully update
  sleep 0.1

  # Create a timestamp for the image filename
  timestamp=$(date +%Y%m%d_%H%M%S)
  image_path="/tmp/clipboard_image_${timestamp}.png"

  # Try to get an image from the clipboard
  if wl-paste --no-newline --type image/png > "$image_path" 2>/dev/null && [ -s "$image_path" ]; then
    # If an image is detected, show it in the notification
    notify-send "Clipboard" "Image copied" -i "$image_path" --hint=string:actions:"[[\"Preview\",\"feh $image_path \"],[\"Edit\",\"gimp $image_path \"],[\"Delete\",\"rm $image_path \"]]"
  else
    # If no image is found, check for text content
    clipboard_content=$(wl-paste --no-newline --type text 2>/dev/null)
    [ -n "$clipboard_content" ] && notify-send "Clipboard" "$clipboard_content"
  fi
'
