#!/bin/bash
screenrecord_dir="$HOME/Videos/ScreenRecords"
screenrecord_fullscreen_dir="$screenrecord_dir/fullscreen"
screenrecord_area_dir="$screenrecord_dir/area"
pid_file="/tmp/screenrecord.pid"
file_name="/tmp/screenrecord_name"

mkdir -p "$screenrecord_dir"
mkdir -p "$screenrecord_fullscreen_dir"
mkdir -p "$screenrecord_area_dir"

is_recorder_pid() {
    # True if $1 is a live wf-recorder process (protects against stale
    # pid files and PID reuse killing an unrelated process).
    [[ "$1" =~ ^[0-9]+$ ]] || return 1
    [[ "$(ps -o comm= -p "$1" 2>/dev/null)" == "wf-recorder" ]]
}

drop_stale_pid() {
    if [[ -f "$pid_file" ]]; then
        old_pid="$(cat "$pid_file" 2>/dev/null)"
        if ! is_recorder_pid "$old_pid"; then
            rm -f "$pid_file" "$file_name"
        fi
    fi
}

start() {
    drop_stale_pid
    if [[ -f "$pid_file" ]]; then
        echo "Already recording (pid $(cat "$pid_file"))" >&2
        exit 1
    fi

    timestamp=$(date +%Y%m%d_%H%M%S)

    # Audio source is optional: a broken value must not kill the recording.
    audio_args=()
    if sink=$(pactl get-default-sink 2>/dev/null) && [[ -n "$sink" ]]; then
        audio_args=(-a "${sink}.monitor")
    fi

    if [[ "$1" == "--area" ]]; then
        file="$screenrecord_area_dir/screenrecord_area_${timestamp}.mp4"
        geometry=$(slurp) || exit 1  # user cancelled selection
        # shellcheck disable=SC2086
        wf-recorder -g "$geometry" ${audio_args[@]} -p crf=24 -p preset=medium -F fps=60 -f "$file" &
    else
        file="$screenrecord_fullscreen_dir/screenrecord_${timestamp}.mp4"
        # shellcheck disable=SC2086
        wf-recorder ${audio_args[@]} -p crf=24 -p preset=medium -F fps=60 -f "$file" &
    fi

    rec_pid=$!
    echo "$rec_pid" > "$pid_file"
    echo "$file" > "$file_name"

    # Verify it actually survived startup (bad args/codec fail fast).
    sleep 1
    if ! is_recorder_pid "$rec_pid"; then
        rm -f "$pid_file" "$file_name"
        echo "wf-recorder failed to start — see output above" >&2
        exit 1
    fi
    notify-send -a "Recorder" -i "media-record" "Recording Started" "$(basename "$file")"
}

stop() {
    drop_stale_pid

    target=""
    if [[ -f "$pid_file" ]]; then
        target="$(cat "$pid_file")"
    fi
    # Fallback when the pid file leaked but a recorder is still running.
    if ! is_recorder_pid "$target"; then
        target="$(pgrep -x wf-recorder | head -n 1)"
    fi
    if ! is_recorder_pid "$target"; then
        rm -f "$pid_file" "$file_name"
        echo "No active recording found" >&2
        exit 1
    fi

    file="$(cat "$file_name" 2>/dev/null)"
    kill -INT "$target"

    # `wait` only works for child processes; poll instead so the file
    # is flushed before we announce completion (max ~5s).
    for _ in $(seq 1 50); do
        is_recorder_pid "$target" || break
        sleep 0.1
    done
    if is_recorder_pid "$target"; then
        kill -KILL "$target" 2>/dev/null
        sleep 0.3
    fi

    rm -f "$pid_file" "$file_name"
    if [[ -n "$file" ]]; then
        wl-copy --type text/uri-list "file://${file}" 2>/dev/null
        notify-send -a "Recorder" -i "media-record" "Recording Stopped" "$(basename "$file")"
    else
        notify-send -a "Recorder" -i "media-record" "Recording Stopped" "File copied to clipboard."
    fi
}

case "$1" in
    start) start "$2" ;;
    stop) stop ;;
    *) echo "Usage: $0 start [--area] | stop"; exit 1 ;;
esac