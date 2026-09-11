import QtQuick
import qs.theme
import qs.services
import qs.widgets.shared

// Results panel for the search island: input lives in SearchIsland,
// this body is results only. Quick apps, recent apps and system
// commands are ">" palette queries (e.g. ">quickapps") handled by
// Launcher.paletteResults — no side panes.
Rectangle {
    id: root

    implicitWidth: 500
    implicitHeight: 448
    radius: Theme.radius
    color: Theme.surface

    // Help tips — visible when query empty OR no results
    Column {
        id: helpCol
        visible: Launcher.results.length === 0
        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
            margins: 10
        }
        spacing: 6
        Text {
            width: parent.width
            text: "Commands"
            font.bold: true
            font.pixelSize: Theme.fontSize + 2
            color: Theme.fg
            visible: helpCol.visible
        }
        Repeater {
            model: [
                {
                    cmd: ">quickapps ...",
                    desc: "favorite apps"
                },
                {
                    cmd: ">recent ...",
                    desc: "recently launched apps"
                },
                {
                    cmd: ">commands ...",
                    desc: "system commands"
                },
                {
                    cmd: "cb ...",
                    desc: "clipboard history (text/html/image)",
                    keys: ["SUPER", "SHIFT", "v"]
                },
                {
                    cmd: "note ...",
                    desc: "add/list/edit/remove notes",
                    keys: ["SUPER", "SHIFT", "n"]
                },
                {
                    cmd: "apps ...",
                    desc: "list all installed applications",
                    keys: ["SUPER", "A"]
                },
                {
                    cmd: "emoji ...",
                    desc: "search emojis",
                    keys: ["SUPER", "."]
                },
                {
                    cmd: "... ...",
                    desc: "open with argument"
                },
                {
                    cmd: "translate .. > ..",
                    desc: "translate into (en,fr,es,de,pt,ru,ar…)"
                },
                {
                    cmd: "... .com OR https://...",
                    desc: "open link"
                },
                {
                    cmd: "..*/+-..",
                    desc: "arithmetics"
                },
                {
                    cmd: "100c to f / 10kg in lb",
                    desc: "unit conversion (temp/weight/length/volume/speed/digital)"
                },
            ]
            delegate: Row {
                width: parent ? parent.width : 0
                spacing: 8
                Text {
                    width: parent.width * 0.38
                    text: modelData.cmd
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 1
                    color: Theme.accent
                    wrapMode: Text.WordWrap
                }
                Column {
                    width: parent.width * 0.62 - 8
                    spacing: 4
                    Text {
                        width: parent.width
                        text: modelData.desc
                        font.pixelSize: Theme.fontSize - 1
                        color: Theme.muted
                        wrapMode: Text.WordWrap
                    }
                    // Keybind chips below the description (shared
                    // AppKeybind widget; hidden automatically when
                    // the entry has no keys).
                    AppKeybind {
                        keys: modelData.keys || []
                    }
                }
            }
        }
    }

    SmoothListView {
        id: resultsList
        visible: Launcher.results.length > 0
        anchors.fill: parent
        anchors.margins: 8
        clip: true
        model: Launcher.results
        currentIndex: Launcher.selectedIndex
        spacing: 2
        delegate: Rectangle {
            required property var modelData
            required property int index
            width: resultsList.width
            height: modelData.isHeader === true ? 28 : ((modelData.actions !== undefined && modelData.actions.length > 0) ? 56 : 52)
            radius: Theme.radius - 2
            color: (modelData.isHeader === true || resultsList.currentIndex !== index) ? "transparent" : Theme.surfaceActive

            // Header row (AGS AppButton app_type === "header").
            // NOTE: strict `=== true` — a bare `modelData.isHeader`
            // is undefined for normal rows, and assigning undefined
            // to bool keeps the default (true), painting the header
            // name over every row's icon.
            Row {
                visible: modelData.isHeader === true
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.leftMargin: 12
                spacing: 5
                Rectangle {
                    width: 4
                    height: 16
                    radius: 2
                    color: Theme.accent
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: modelData.name
                    anchors.verticalCenter: parent.verticalCenter
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 1
                    font.bold: true
                    color: Theme.muted
                }
            }

            // Normal result row — unified AppEntry (real app icons
            // via IconImage, glyphs via Text, letter fallback).
            AppEntry {
                visible: modelData.isHeader !== true

                anchors.left: parent.left
                anchors.right: parent.right

                entry: modelData
                selected: resultsList.currentIndex === index
                rightReserve: (modelData.actions !== undefined && modelData.actions.length > 0) ? 102 : 10
            }

            // Inline action buttons (AGS AppButton app_actions)
            Row {
                visible: modelData.isHeader !== true && modelData.actions !== undefined && modelData.actions.length > 0
                anchors.right: parent.right
                anchors.rightMargin: 8
                anchors.verticalCenter: parent.verticalCenter
                spacing: 4
                Repeater {
                    model: modelData.actions
                    delegate: AppButton {
                        text: modelData.label
                        height: 26
                        pixelSize: Theme.fontSize - 1
                        cornerRadius: 4
                        idleBg: Theme.surface
                        outlined: true
                        tooltipText: modelData.tooltip || modelData.label
                        onClicked: modelData.onClick()
                    }
                }
            }

            // Hover selection + click launch.
            // NOTE: no attached ToolTip here — name/description/args
            // are already fully visible inline via AppEntry, and a
            // second rendering of the name is exactly the
            // "duplicated name" artifact (tooltips can stick on
            // layer-shell surfaces).
            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                hoverEnabled: true
                onEntered: {
                    if (!modelData.isHeader)
                        Launcher.selectedIndex = index;
                }
                onClicked: {
                    if (!modelData.isHeader && modelData.launch) {
                        modelData.launch();
                        BarState.deactivate("search");
                    }
                }
            }
        }
    }

    // keyboard nav comes from SearchIsland signals; reset state on close
    Connections {
        target: BarState
        function onStateChanged() {
            if (BarState.state === "search") {
                Launcher.lastQuery = "";
                Launcher.results = [];
                Launcher.selectedIndex = 0;
            }
        }
    }
}
