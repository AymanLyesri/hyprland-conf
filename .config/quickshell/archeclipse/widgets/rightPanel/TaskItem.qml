import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.theme
import qs.widgets.shared

// Script Timer Task Item component
Item {
    id: root
    property var task: {}
    signal deleteClicked(string id)
    signal editClicked(var task)
    signal toggleClicked(string id)

    property bool isHovered: false

    // Height follows content (inner Column is top-anchored, never
    // fill-anchored: no height feedback loop).
    height: innerCol.height + 24

    Rectangle {
        id: container
        anchors.fill: parent
        color: task.active ? Theme.surface : Theme.bg
        radius: Theme.radius

        border.color: task.active ? Theme.border : Theme.fgDim
        clip: true

        Column {
            id: innerCol
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.topMargin: 12
            anchors.leftMargin: 12
            anchors.rightMargin: 12
            spacing: 6

            // Header (RowLayout: the text column takes leftover width and
            // elides — a plain Row with a dead Layout.fillWidth spacer and
            // an unbounded text column overflowed).
            RowLayout {
                width: parent.width
                spacing: 8
                Column {
                    Layout.fillWidth: true
                    spacing: 2
                    Label {
                        id: nameLabel
                        text: task.name
                        font.pixelSize: Theme.fontSize + 2
                        font.bold: true
                        color: task.active ? Theme.fg : Theme.fgDim
                        width: parent.width
                        elide: Text.ElideRight
                    }
                    Row {
                        spacing: 5
                        width: parent.width
                        Label {
                            id: scheduleLabel
                            text: root.formatNextRun(task.nextRun)
                            font.pixelSize: Theme.fontSize - 1
                            color: Theme.fgDim
                            width: parent.width - typeLabel.implicitWidth - 5
                            elide: Text.ElideRight
                        }
                        Label {
                            id: typeLabel
                            text: task.type ? "🔁" : "1️⃣"
                            font.pixelSize: Theme.fontSize - 1
                            color: Theme.fgDim
                        }
                    }
                }

                // Hover actions
                Row {
                    id: actionButtons
                    spacing: 4
                    visible: isHovered
                    opacity: isHovered ? 1 : 0
                    Behavior on opacity {
                        NumberAnimation {
                            duration: 150
                        }
                    }

                    AppCheckBox {
                        id: activeCheck
                        checked: task.active
                        onToggled: root.toggleClicked(task.id)
                    }
                    AppButton {
                        icon: "\u{f040}"
                        idleBg: Theme.surfaceActive
                        idleFg: Theme.accent
                        outlined: true
                        outlineColor: Theme.accent
                        tooltipText: "Edit"
                        onClicked: root.editClicked(task)
                    }
                    AppButton {
                        icon: "\u{f00d}"
                        idleBg: Theme.dangerBg
                        idleFg: Theme.danger
                        outlined: true
                        outlineColor: Theme.danger
                        tooltipText: "Delete"
                        onClicked: root.deleteClicked(task.id)
                    }
                }
            }

            // Command
            Label {
                text: task.command.length > 40 ? task.command.substring(0, 40) + "..." : task.command
                font.pixelSize: Theme.fontSize - 1
                color: Theme.fgDim
                width: parent.width
                elide: Text.ElideRight
            }
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            onEntered: root.isHovered = true
            onExited: root.isHovered = false
        }
    }

    function formatNextRun(nextRun) {
        if (!nextRun)
            return "Not scheduled";
        const date = new Date(nextRun);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return "Today, " + date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
        }
        return date.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            month: "short",
            day: "numeric"
        });
    }
}
