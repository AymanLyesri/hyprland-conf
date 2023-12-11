#!/bin/bash

# ic=(0 一 二 三 四 五 六 七 八 九 〇)
ic=(0m Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ Ⅶ Ⅷ Ⅸ Ⅹ)

max_workspace=10

workspace() {

  workspace_height="\${bar_height}px"
  workspace_width="\${bar_height * 1.15}px"
  workspace_margin="\${2 - bar_height * 0.1}px"
  button_style="min-width:${workspace_width}; margin-left:${workspace_margin}; margin-right:${workspace_margin}"

  ws_focused=$(hyprctl monitors | grep active | awk '{print $3}')
  ws_active=$(hyprctl workspaces)

  echo -n "(box :class 'ws' :style 'min-height:${workspace_height}' :spacing 5 :space-evenly 'false'"

  for i in $(seq 1 $max_workspace); do

    if [[ $i == 1 ]]; then
      if [[ $ws_focused == $i ]]; then
        echo -n "(button :class 'ws-btn-focused first-button' :style '$button_style'  :onclick 'hyprctl dispatch workspace $i' (label :text '卍')) "
      elif [[ $(echo "$ws_active" | grep "ID $i" | awk '{print $3}') == $i ]]; then
        echo -n "(button :class 'ws-btn-active first-button' :style '$button_style' :onclick 'hyprctl dispatch workspace $i' (label :text '${ic[$i]}')) "
      else
        echo -n "(button :class 'ws-btn first-button' :style '$button_style' :onclick 'hyprctl dispatch workspace $i' (label :text '${ic[$i]}')) "
      fi
      continue
    fi

    if [[ $ws_focused == $i ]]; then
      echo -n "(button :class 'ws-btn-focused' :style '$button_style'  :onclick 'hyprctl dispatch workspace $i' (label :text '卍')) "
    elif [[ $(echo "$ws_active" | grep "ID $i" | awk '{print $3}') == $i ]]; then
      echo -n "(button :class 'ws-btn-active' :style '$button_style' :onclick 'hyprctl dispatch workspace $i' (label :text '${ic[$i]}')) "
    else
      echo -n "(button :class 'ws-btn' :style '$button_style' :onclick 'hyprctl dispatch workspace $i' (label :text '${ic[$i]}')) "
    fi
  done
  echo ")"
}

get_window_active() {
  win_active=$(hyprctl activewindow | grep -m 1 'initialClass' | awk '{print $2}')
  if [[ ! -z "$win_active" ]]; then
    echo "$win_active"
  else
    echo ""
  fi
}

get_active_window_color() {
  win_active=$(get_window_active)
  case $win_active in
  "Code")
    echo "background-color: rgb(100,100,200); color: rgb(255,255,255);"
    ;;
  "kitty")
    echo "background-color: rgb(240,75,75); color: rgb(255,255,255);"
    ;;
  "Spotify")
    echo "background-color: rgb(100,200,100); color: rgb(0,0,0);"
    ;;
  "firefox")
    echo "background-color: rgb(240,155,100); color: rgb(255,255,255);"
    ;;
  "Rofi")
    echo "background-color: rgb(255,255,255); color: rgb(0,0,0);"
    ;;
  "Rofi")
    echo "background-color: rgb(255,255,255); color: rgb(0,0,0);"
    ;;
  "dotnet")
    echo "background-color: rgb(255,0,200); color: rgb(255,255,255);"
    ;;
  "steam")
    echo "background-color: rgb(0,0,155); color: rgb(255,255,255);"
    ;;
  *)
    echo ""
    ;;
  esac
}

case "$1" in
"--active-window")
  get_window_active
  ;;
"--active-window-color")
  get_active_window_color
  ;;
*)

  if [[ $1 == +1 && $ws_focused -ge $max_workspace ]]; then
    hyprctl dispatch workspace 1
    exit 1
  elif [[ $1 == -1 && $ws_focused == 1 ]]; then
    hyprctl dispatch workspace $max_workspace
    exit 1
  elif [[ ! -z "$1" ]]; then
    hyprctl dispatch workspace "$1"
    exit 1
  fi

  workspace

  socat -u UNIX-CONNECT:/tmp/hypr/"$HYPRLAND_INSTANCE_SIGNATURE"/.socket2.sock - | while read -r event; do
    workspace
  done
  ;;
esac
