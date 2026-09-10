pragma Singleton
import QtQuick
import Quickshell
import qs.services
import qs.theme

// Registry — tracks island/window handles by monitor name for IPC lookup.
// Side islands register themselves as "left-island-<monitorName>" (and the
// bare "left-island" alias); other windows keep their own keys.
QtObject {
    id: root

    readonly property string monitorName: {
        const mon = Quickshell.Hyprland?.focusedMonitor
        return mon ? mon.name : Quickshell.env("MONITOR_NAME") || "eDP-1"
    }

    property var _windows: ({})

    function register(name, window) {
        root._windows[name] = window
    }

    function unregister(name) {
        delete root._windows[name]
    }

    function get(name) {
        return root._windows[name] || null
    }

    function toggle(name) {
        const w = root.get(name)
        if (w) w.visible = !w.visible
    }

    // Show the left island and switch its active tab
    // (mirrors AGS QuickApps "Keybinds": show left panel + setGlobalSetting leftPanel.widget).
    function selectLeftTab(tabName) {
        Settings.leftPanelWidget = tabName;
        BarState.activate("left", 0);
    }
}
