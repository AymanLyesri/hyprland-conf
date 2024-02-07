#!/bin/bash

# true loop

while true; do

  win_active=$(hyprctl activewindow | grep -m 1 'initialClass' | awk '{print $2}')
  if [[ ! -z "$win_active" ]]; then
    case $win_active in
    "Code")
      background_image="100,100,200"
      color="rgb(255,255,255)"
      ;;
    "kitty")
      background_image="240,75,75"
      color="rgb(255,255,255)"
      ;;
    "Spotify")
      background_image="100,200,100"
      color="rgb(0,0,0)"
      ;;
    "firefox")
      background_image="240,155,100"
      color="rgb(255,255,255)"
      ;;
    "Rofi")
      background_image="255,255,255"
      color="rgb(0,0,0)"
      ;;
    "Rofi")
      background_image="255,255,255"
      color="rgb(0,0,0)"
      ;;
    "dotnet")
      background_image="255,0,200"
      color="rgb(255,255,255)"
      ;;
    "steam")
      background_image="0,0,155"
      color="rgb(255,255,255)"
      ;;
    *)
      background_image="255,255,255"
      color="rgb(0,0,0)"
      ;;
    esac
    style="background-image: linear-gradient(to bottom right, rgba($background_image, 0.5), rgba($background_image, 1), rgba($background_image, 0.5)); color:$color; min-width:$(echo $win_active | wc -c | awk '{print $1 * 10}')px;"
    echo "[\"$win_active\",\"$style\"]"
  else
    echo "[]"
  fi

  sleep 1

done
