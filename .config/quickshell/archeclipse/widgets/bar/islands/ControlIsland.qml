import QtQuick
import Quickshell
import qs.theme
import qs.services
import qs.widgets.controlPanel

// Control island: quick-settings body inline in the bar pill.
// Same spring-unfold pattern as SearchIsland — the pill grows (width via
// the pill spring, height snapped on the window) while this body unfolds.
//
// Focus: OnDemand (no keyboard grab) so the user can type elsewhere while
// it is open. Clicking a slider focuses the surface, then Esc dismisses.
// Leave: 1s after the cursor exits, the island closes itself.
// Pulse states (volume/brightness keys) render through this same island;
// hovering one pins it persistent so it doesn't close mid-drag.
Column {
    id: root
    width: controlBody.width
    spacing: 0

    // Island owner passes the bar's monitor; body falls back to focused.
    property string monitorName: ""

    // Spring driver: 0 -> 1 on creation unfolds the body.
    property real expand: 0
    // Arm the leave timer at creation too: if the cursor never enters,
    // no hover transition fires and the island would stay open forever.
    // (A hover arrival within milliseconds stops it again.)
    Component.onCompleted: { expand = 1; leaveTimer.restart() }
    Behavior on expand {
        SpringAnimation { spring: 3.5; damping: 0.32; mass: 1.0 }
    }

    // Hover tracking lives here (stable container — content never swaps
    // under the cursor while open).
    HoverHandler {
        id: islandHover
        onHoveredChanged: {
            if (islandHover.hovered) {
                leaveTimer.stop();
                // Pin pulse-driven islands so a hold expiry can't close
                // the panel while it is being used.
                if (BarState.state === "volume" || BarState.state === "brightness")
                    BarState.activate("control", 0);
            } else {
                leaveTimer.restart();
            }
        }
    }
    Timer {
        id: leaveTimer
        interval: 1000
        onTriggered: {
            BarState.deactivate("control");
            BarState.deactivate("volume");
            BarState.deactivate("brightness");
        }
    }

    // Esc dismiss once the surface has focus (click a slider first).
    Item {
        id: escGrab
        width: 1; height: 1
        focus: true
        Keys.onEscapePressed: {
            BarState.deactivate("control");
            BarState.deactivate("volume");
            BarState.deactivate("brightness");
        }
    }

    Item {
        id: bodyClip
        width: parent.width
        height: Math.max(0, root.expand * controlBody.height)
        clip: true
        opacity: Math.max(0, Math.min(1, root.expand * 1.2))
        scale: 0.96 + 0.04 * root.expand
        transformOrigin: Item.Top

        ControlPanelBody {
            id: controlBody
            anchors.top: parent.top
            monitorName: root.monitorName
        }
    }
}
