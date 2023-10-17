#!/bin/bash

calendar() {
LOCK_FILE="$HOME/.cache/eww-calendar.lock"
EWW_BIN="$HOME/.local/bin/eww/eww"

run() {
    ${EWW_BIN} -c $HOME/.config/eww/bar open calendar
}

# Open widgets
if [[ ! -f "$LOCK_FILE" ]]; then
    ${EWW_BIN} -c $HOME/.config/eww/bar close system music_win audio_ctl
    touch "$LOCK_FILE"
    run && echo "ok good!"
else
    ${EWW_BIN} -c $HOME/.config/eww/bar close calendar
    rm "$LOCK_FILE" && echo "closed"
fi
}


system() {
LOCK_FILE_MEM="$HOME/.cache/eww-system.lock"
EWW_BIN="$HOME/.local/bin/eww/eww"

run() {
    ${EWW_BIN} -c $HOME/.config/eww/bar open system 
}

# Open widgets
if [[ ! -f "$LOCK_FILE_MEM" ]]; then
    ${EWW_BIN} -c $HOME/.config/eww/bar close calendar music_win audio_ctl
    touch "$LOCK_FILE_MEM"
    run && echo "ok good!"
else
    ${EWW_BIN} -c $HOME/.config/eww/bar close system 
    rm "$LOCK_FILE_MEM" && echo "closed"
fi
}


music() {
LOCK_FILE_SONG="$HOME/.cache/eww-song.lock"
EWW_BIN="$HOME/.local/bin/eww/eww"

run() {
    ${EWW_BIN} -c $HOME/.config/eww/bar open music_win 
}

# Open widgets
if [[ ! -f "$LOCK_FILE_SONG" ]]; then
    ${EWW_BIN} -c $HOME/.config/eww/bar close system calendar
    touch "$LOCK_FILE_SONG"
    run && echo "ok good!"
else
    ${EWW_BIN} -c $HOME/.config/eww/bar close music_win
    rm "$LOCK_FILE_SONG" && echo "closed"
fi
}



audio() {
LOCK_FILE_AUDIO="$HOME/.cache/eww-audio.lock"
EWW_BIN="$HOME/.local/bin/eww/eww"

run() {
    ${EWW_BIN} -c $HOME/.config/eww/bar open audio_ctl 
}

# Open widgets
if [[ ! -f "$LOCK_FILE_AUDIO" ]]; then
    ${EWW_BIN} -c $HOME/.config/eww/bar close system calendar music
    touch "$LOCK_FILE_AUDIO"
    run && echo "ok good!"
else
    ${EWW_BIN} -c $HOME/.config/eww/bar close audio_ctl
    rm "$LOCK_FILE_AUDIO" && echo "closed"
fi
}


if [ "$1" = "calendar" ]; then
calendar
elif [ "$1" = "system" ]; then
system
elif [ "$1" = "music" ]; then
music
elif [ "$1" = "audio" ]; then
audio
fi
