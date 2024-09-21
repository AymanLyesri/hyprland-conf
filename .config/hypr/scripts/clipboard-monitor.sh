#!/bin/bash

# Script to watch the clipboard and send a single notification with the copied content

# Use wl-paste to watch the clipboard
wl-paste --watch bash -c '
  clipboard_content=$(wl-paste --no-newline --type text 2>/dev/null)
  
  if [ -n "$clipboard_content" ]; then
    sanitized_content=$(echo "$clipboard_content" | tr "\n" " ")
    notify-send "Clipboard" "$sanitized_content"
  fi
'
