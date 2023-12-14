#!/bin/bash

# true loop

while true; do

  win_active=$(hyprctl activewindow | grep -m 1 'initialClass' | awk '{print $2}')
  if [[ ! -z "$win_active" ]]; then

    case $win_active in
    "Code")
      style="background-color: rgb(100,100,200); color: rgb(255,255,255)"
      ;;
    "kitty")
      style="background-color: rgb(240,75,75); color: rgb(255,255,255)"
      ;;
    "Spotify")
      style="background-color: rgb(100,200,100); color: rgb(0,0,0)"
      ;;
    "firefox")
      style="background-color: rgb(240,155,100); color: rgb(255,255,255)"
      ;;
    "Rofi")
      style="background-color: rgb(255,255,255); color: rgb(0,0,0)"
      ;;
    "Rofi")
      style="background-color: rgb(255,255,255); color: rgb(0,0,0)"
      ;;
    "dotnet")
      style="background-color: rgb(255,0,200); color: rgb(255,255,255)"
      ;;
    "steam")
      style="background-color: rgb(0,0,155); color: rgb(255,255,255)"
      ;;
    *)
      echo ""
      ;;
    esac

    style+="; min-width:$(echo $win_active | wc -c | awk '{print $1 * 10}')px;"
    echo "[\"$win_active\",\"$style\"]"
  else
    echo "[]"
  fi

  sleep 1

done
