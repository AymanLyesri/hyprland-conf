import QtQuick
import Quickshell
import qs.services
import qs.widgets.wallpaperPanel

// Wallpaper island: the full switcher body inline in the bar pill.
// Same spring-unfold pattern as SearchIsland — the pill grows (width via
// the pill spring, height snapped on the window) while this body unfolds.
//
// Persistent like SearchIsland (no leave auto-close — picking a wallpaper
// is a task, not a hover peek). Closes via Esc, SUPER+W toggle, or the
// control-panel wallpaper button.
Column {
    id: root
    width: 1500
    spacing: 0

    // Island owner passes the bar's monitor; body falls back to focused.
    property string monitorName: ""

    // Spring driver: 0 -> 1 on creation unfolds the body.
    property real expand: 0
    Component.onCompleted: {
        expand = 1;
        Registry.register(root.registryKey(), body);
        Registry.register("wallpaper-island", body);
    }
    onMonitorNameChanged: {
        if (root.monitorName !== "")
            Registry.register(root.registryKey(), body);
    }
    Component.onDestruction: {
        Registry.unregister(root.registryKey());
        Registry.unregister("wallpaper-island");
    }
    function registryKey() {
        return `wallpaper-island-${root.monitorName || Registry.monitorName}`;
    }
    Behavior on expand {
        SpringAnimation {
            spring: 3.5
            damping: 0.32
            mass: 1.0
        }
    }

    // Esc dismiss once the surface has focus (click a control first).
    Item {
        id: escGrab
        width: 1
        height: 1
        focus: true
        Keys.onEscapePressed: BarState.deactivate("wallpaper")
    }

    Item {
        id: bodyClip
        width: parent.width
        height: Math.max(0, root.expand * body.height)
        clip: true
        opacity: Math.max(0, Math.min(1, root.expand * 1.2))
        scale: 0.96 + 0.04 * root.expand
        transformOrigin: Item.Top

        WallpaperPanelBody {
            id: body
            anchors.top: parent.top
            width: parent.width
            height: 360
            monitorName: root.monitorName
        }
    }
}
