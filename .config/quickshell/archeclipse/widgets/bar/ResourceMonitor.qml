import QtQuick
import QtQuick.Controls
import Quickshell.Hyprland
import qs.theme
import qs.services

// Port of Utilities.tsx ResourceMonitor — CPU / RAM / GPU circular rings.
// Hover/click pulses the system-monitor island (BarState "system").
// Middle-click keeps the legacy AGS behavior (dispatch to workspace 5).
Row {
    id: root
    spacing: 10

    readonly property var res: SysInfo.systemResources
    // AGS maxGpuLoad returns 0-100; the ring expects 0-1, so normalize here.
    readonly property real cpuFrac: (res?.cpuLoad ?? null) !== null ? Math.max(0, Math.min(1, res.cpuLoad / 100)) : -1
    readonly property real ramFrac: (res?.ramUsedGB ?? null) !== null && (res?.ramTotalGB ?? null) ? Math.max(0, Math.min(1, res.ramUsedGB / res.ramTotalGB)) : -1
    readonly property real gpuFrac: {
        const loads = (res?.gpus ?? []).map(g => g.load).filter(l => l !== null && l !== undefined);
        if (!loads.length)
            return -1;
        return Math.max(0, Math.min(1, Math.max(...loads) / 100));
    }
    readonly property string gpuTip: {
        const gpus = res?.gpus ?? [];
        if (!gpus.length)
            return "GPU: N/A";
        return gpus.map(g => `${g.driver}: ${g.load ?? "N/A"}%`).join(" | ");
    }

    function pulseIsland(holdMs) {
        BarState.activate("system", holdMs);
    }

    Repeater {
        model: [
            {
                icon: "",
                frac: root.cpuFrac,
                tip: root.res ? `CPU Usage ${Number(root.res.cpuLoad).toFixed(1)}%` : "CPU: N/A"
            },
            {
                icon: "",
                frac: root.ramFrac,
                tip: root.res ? `RAM Usage ${Math.round(root.ramFrac * 100)}% (${Number(root.res.ramUsedGB).toFixed(2)}/${Number(root.res.ramTotalGB).toFixed(2)} GB)` : "RAM: N/A"
            },
            {
                icon: "󱤟",
                frac: root.gpuFrac,
                tip: root.gpuTip
            }
        ]

        Item {
            id: ringItem
            required property var modelData
            // -1 = no data -> hide ring (AGS visible={...} parity)
            readonly property real frac: modelData.frac
            visible: frac >= 0

            width: 18
            height: 18
            anchors.verticalCenter: parent.verticalCenter

            Canvas {
                id: canvas
                anchors.fill: parent
                onPaint: {
                    const ctx = getContext("2d");
                    ctx.reset();
                    const cx = width / 2, cy = height / 2, r = width / 2 - 1.5;
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = Qt.rgba(1, 1, 1, 0.15);
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                    if (ringItem.frac > 0) {
                        ctx.strokeStyle = Theme.muted;
                        ctx.beginPath();
                        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ringItem.frac * Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            // Canvas only repaints on request — re-fire when the fraction
            // (or theme) changes, otherwise the ring freezes at its first
            // paint (which is why it looked stuck at max).
            onFracChanged: canvas.requestPaint()
            Connections {
                target: Theme
                function onMutedChanged() { canvas.requestPaint(); }
            }
            Component.onCompleted: canvas.requestPaint()

            Text {
                anchors.centerIn: parent
                text: ringItem.modelData.icon
                color: Theme.fg
                font.family: Theme.fontFamily
                font.pixelSize: 9
            }

            ToolTip.visible: ringHover.hovered
            ToolTip.text: ringItem.modelData.tip
            ToolTip.delay: 500

            HoverHandler {
                id: ringHover
                onHoveredChanged: {
                    if (ringHover.hovered)
                        root.pulseIsland(3000);
                }
            }
            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                acceptedButtons: Qt.LeftButton | Qt.MiddleButton
                onClicked: mouse => {
                    if (mouse.button === Qt.MiddleButton) {
                        // Legacy AGS behavior: jump to the monitor workspace.
                        Hyprland.dispatch("workspace 5");
                        return;
                    }
                    // Left-click pins the island; clicking again dismisses it.
                    if (BarState.state === "system")
                        BarState.deactivate("system");
                    else
                        BarState.activate("system", 0);
                }
            }
        }
    }
}
