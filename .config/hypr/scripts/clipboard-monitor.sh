#!/bin/bash

# Script to watch the clipboard and send a single notification with the copied content

# Use wl-paste to watch the clipboard
wl-paste --watch bash -c '
  # Capture the entire clipboard content into a variable
  clipboard_content=$(wl-paste)
  
  # Replace line breaks with spaces
  sanitized_content=$(echo "$clipboard_content" | tr "\n" " ")
  
  # Send a single notification with the sanitized content
  notify-send "Clipboard Content" "$sanitized_content"
'
