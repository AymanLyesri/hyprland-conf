import QtQuick
import Quickshell.Hyprland
import qs.theme
import qs.services

// Bottom workspace strip: 10 bars, 5px tall, stretched across the bar width.
// Empty = greyed out (muted, low opacity), occupied = full opacity.
// On workspace switch (or strip hover) the strip expands in height and
// reveals each workspace's app icon, then collapses back after peekDuration.
Item {
    id: root

    property int count: 10
    property real barHeight: 4
    property real iconSize: 16
    property real btnSpacing: 4
    property real hitHeight: 6
    property real expandedHeight: 32
    property int peekDuration: 2000

    property bool expanded: false
    readonly property bool showIcons: root.expanded || stripHover.hovered

    implicitHeight: showIcons ? expandedHeight : hitHeight
    Behavior on implicitHeight {
        NumberAnimation {
            duration: 250
            easing.type: Easing.OutCubic
        }
    }

    HoverHandler {
        id: stripHover
    }

    readonly property int focusedId: Hyprland.focusedWorkspace?.id ?? 1
    onFocusedIdChanged: {
        root.expanded = true;
        peekTimer.restart();
    }
    Timer {
        id: peekTimer
        interval: root.peekDuration
        onTriggered: root.expanded = false
    }

    // per-workspace snapshot (reactive): [{id, occupied, icon}]
    readonly property var wsData: {
        Hyprland.toplevels.values;
        Hyprland.workspaces.values;
        const out = [];
        for (let i = 1; i <= root.count; i++) {
            const tops = Hyprland.toplevels.values.filter(t => (t.workspace?.id ?? -1) === i);
            out.push({
                id: i,
                occupied: tops.length > 0,
                icon: tops.length > 0 ? WorkspaceIcons.forClientClass(tops[0].lastIpcObject?.class ?? "") : WorkspaceIcons.emptyIcon
            });
        }
        return out;
    }

    Row {
        id: strip
        anchors.fill: parent
        spacing: root.btnSpacing

        Repeater {
            model: root.wsData

            Item {
                id: slot
                required property var modelData
                readonly property int wid: modelData.id
                readonly property bool focused: root.focusedId === wid
                readonly property bool occupied: modelData.occupied

                width: Math.max(0, (strip.width - root.btnSpacing * (root.count - 1)) / root.count)
                height: strip.height

                Column {
                    anchors.centerIn: parent
                    spacing: 2

                    // icon holder — grows/collapses with the peek state
                    Item {
                        width: slot.width
                        height: root.showIcons ? root.iconSize + 2 : 0
                        clip: true

                        Behavior on height {
                            NumberAnimation {
                                duration: 250
                                easing.type: Easing.OutCubic
                            }
                        }

                        Text {
                            anchors.centerIn: parent
                            text: slot.modelData.icon
                            color: slot.focused ? Theme.accent : slot.occupied ? Theme.fg : Theme.muted
                            opacity: root.showIcons ? ((slot.focused || slot.occupied) ? 1.0 : 0.35) : 0
                            font.family: Theme.fontFamily
                            font.pixelSize: root.iconSize

                            Behavior on opacity {
                                NumberAnimation {
                                    duration: 200
                                }
                            }
                        }
                    }

                    Rectangle {
                        id: bar
                        anchors.horizontalCenter: parent.horizontalCenter
                        width: slot.width
                        height: root.barHeight
                        radius: root.barHeight / 2
                        color: slot.focused ? Theme.accent : slot.occupied ? Theme.fg : Theme.muted
                        opacity: (slot.focused || slot.occupied) ? 1.0 : 0.35

                        Behavior on color {
                            ColorAnimation {
                                duration: 200
                            }
                        }
                        Behavior on opacity {
                            NumberAnimation {
                                duration: 200
                            }
                        }
                        Behavior on width {
                            NumberAnimation {
                                duration: 200
                                easing.type: Easing.OutCubic
                            }
                        }
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: Hyprland.dispatch(`hl.dsp.focus({workspace=${slot.wid}})`)
                }
            }
        }
    }
}
