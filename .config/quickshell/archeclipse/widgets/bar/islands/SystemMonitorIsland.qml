import QtQuick
import QtQuick.Controls
import qs.theme
import qs.services

// System-monitor island — in-bar expansion of the ResourceMonitor rings.
// Layout mirrors the AGS SystemResources popover (Utilities.tsx popover +
// rightPanel/components/SystemResources.tsx): a header with update time
// plus CPU / RAM / GPU columns, each with a thin usage bar.
// Hover/click on the rings pulses BarState "system"; hovering this island
// pins it so the pulse can't close it mid-read.
Item {
    id: root
    property int islandMargins: 5
    property int islandWidth: 440

    readonly property var stats: SysInfo.systemResources
    readonly property var gpus: stats?.gpus ?? []
    readonly property real cpuFrac: (stats?.cpuLoad ?? null) !== null ? Math.max(0, Math.min(1, stats.cpuLoad / 100)) : 0
    readonly property real ramFrac: (stats?.ramUsedGB && stats?.ramTotalGB) ? Math.max(0, Math.min(1, stats.ramUsedGB / stats.ramTotalGB)) : 0
    readonly property int totalCards: 2 + root.gpus.length
    readonly property real cardWidth: root.gpus.length > 0 ? (islandWidth - 8 * (root.totalCards - 1)) / root.totalCards : (islandWidth - 8) / 2

    implicitWidth: islandWidth + islandMargins * 2
    implicitHeight: content.height + islandMargins * 2
    width: implicitWidth
    height: implicitHeight

    function fmt(v, digits, suffix) {
        if (v === null || v === undefined || (typeof v === "number" && isNaN(v)))
            return "N/A";
        return Number(v).toFixed(digits) + (suffix ?? "");
    }
    function gpuMem(used, total) {
        if (used === null || used === undefined)
            return "N/A";
        if (total === null || total === undefined)
            return Number(used).toFixed(2) + " GB";
        return Number(used).toFixed(2) + "/" + Number(total).toFixed(2) + " GB";
    }

    Column {
        id: content
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: root.islandMargins
        width: root.islandWidth
        spacing: 8

        // ---- header (AGS SystemResources .header) ----
        Row {
            width: parent.width
            spacing: 8
            Label {
                text: "System Resources"
                font.pixelSize: Theme.fontSize + 2
                font.bold: true
                color: Theme.fg
                width: parent.width - updatedLabel.width - 8
                elide: Text.ElideRight
            }
            Label {
                id: updatedLabel
                text: root.stats ? "Updated: " + (root.stats.updatedAt || "--") : "Updated: --"
                font.pixelSize: Theme.fontSize - 2
                color: Theme.fgDim
            }
        }

        Label {
            visible: !root.stats
            text: "Collecting system stats…"
            color: Theme.fgDim
            font.pixelSize: Theme.fontSize
        }

        // ---- resource columns (AGS .resource-columns, horizontal) ----
        Row {
            id: cols
            visible: root.stats
            width: parent.width
            spacing: 8

            // CPU card
            Rectangle {
                width: root.cardWidth
                height: cpuCol.height + 16
                radius: 8
                color: Theme.surface
                border.color: Theme.border
                Column {
                    id: cpuCol
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 8
                    spacing: 4
                    Text {
                        text: " CPU"
                        font.pixelSize: Theme.fontSize
                        font.bold: true
                        font.family: Theme.fontFamily
                        color: Theme.fg
                    }
                    // usage bar
                    Rectangle {
                        width: parent.width
                        height: 4
                        radius: 2
                        color: Theme.color8
                        Rectangle {
                            width: parent.width * root.cpuFrac
                            height: parent.height
                            radius: 2
                            color: Theme.accent
                            Behavior on width { NumberAnimation { duration: 150 } }
                        }
                    }
                    Text { text: "Load: " + root.fmt(root.stats?.cpuLoad, 1, "%"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                    Text { text: "Clock: " + root.fmt(root.stats?.clockGHz, 2, " GHz"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                    Text { text: "Temp: " + root.fmt(root.stats?.cpuTempC, 1, "°C"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                }
            }

            // RAM card
            Rectangle {
                width: root.cardWidth
                height: ramCol.height + 16
                radius: 8
                color: Theme.surface
                border.color: Theme.border
                Column {
                    id: ramCol
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 8
                    spacing: 4
                    Text {
                        text: " RAM"
                        font.pixelSize: Theme.fontSize
                        font.bold: true
                        font.family: Theme.fontFamily
                        color: Theme.fg
                    }
                    Rectangle {
                        width: parent.width
                        height: 4
                        radius: 2
                        color: Theme.color8
                        Rectangle {
                            width: parent.width * root.ramFrac
                            height: parent.height
                            radius: 2
                            color: Theme.accent
                            Behavior on width { NumberAnimation { duration: 150 } }
                        }
                    }
                    Text { text: "Used: " + root.fmt(root.stats?.ramUsedGB, 2, " GB"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                    Text { text: "Free: " + root.fmt(root.stats?.ramFreeGB, 2, " GB"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                    Text { text: "Total: " + root.fmt(root.stats?.ramTotalGB, 2, " GB"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                }
            }

            // GPU cards (dynamic, AGS gpus.map parity)
            Repeater {
                model: root.gpus
                Rectangle {
                    id: gpuCard
                    required property var modelData
                    required property int index
                    width: root.cardWidth
                    height: gpuCol.height + 16
                    radius: 8
                    color: Theme.surface
                    border.color: Theme.border
                    readonly property real frac: (modelData.load ?? null) !== null ? Math.max(0, Math.min(1, modelData.load / 100)) : 0
                    Column {
                        id: gpuCol
                        anchors.top: parent.top
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.margins: 8
                        spacing: 4
                        Text {
                            text: "󱤟 " + (gpuCard.modelData.label || "GPU")
                            font.pixelSize: Theme.fontSize
                            font.bold: true
                            font.family: Theme.fontFamily
                            color: Theme.fg
                            elide: Text.ElideRight
                            width: parent.width
                        }
                        Rectangle {
                            width: parent.width
                            height: 4
                            radius: 2
                            color: Theme.color8
                            Rectangle {
                                width: parent.width * gpuCard.frac
                                height: parent.height
                                radius: 2
                                color: Theme.accent
                                Behavior on width { NumberAnimation { duration: 150 } }
                            }
                        }
                        Text { text: "Load: " + root.fmt(gpuCard.modelData.load, 1, "%"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                        Text { text: "Mem: " + root.gpuMem(gpuCard.modelData.memoryUsedGB, gpuCard.modelData.memoryTotalGB); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg; elide: Text.ElideRight; width: parent.width }
                        Text { text: "Temp: " + root.fmt(gpuCard.modelData.tempC, 1, "°C"); font.pixelSize: Theme.fontSize - 1; font.family: Theme.fontFamily; color: Theme.fg }
                    }
                }
            }
        }
    }

    // Pin while hovered so the pulse doesn't close it mid-read.
    HoverHandler {
        id: islandHover
        onHoveredChanged: {
            if (islandHover.hovered) {
                leaveTimer.stop();
                BarState.activate("system", 0);
            } else {
                leaveTimer.restart();
            }
        }
    }
    Timer {
        id: leaveTimer
        interval: 1000
        onTriggered: BarState.deactivate("system")
    }
    Component.onCompleted: leaveTimer.restart()
}
