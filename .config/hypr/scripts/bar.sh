#!/bin/bash

# ArchEclipse status bar launcher (Quickshell/QtQuick).

QS_CONF="${XDG_CONFIG_HOME:-$HOME/.config}/quickshell/archeclipse"

run_quickshell() {
    pkill -f "qs -p ${QS_CONF}"
    killall qs >/dev/null 2>&1
    while pgrep -f "qs -p ${QS_CONF}" >/dev/null; do sleep 0.1; done
    
    MANGOHUD=0 QML_DISABLE_DISK_CACHE=1 \
    nohup qs -p "$QS_CONF" > "/tmp/qs-bar-${USER}.log" 2>&1 &
}

# ---- active implementation ----
run_quickshell

exit 0
