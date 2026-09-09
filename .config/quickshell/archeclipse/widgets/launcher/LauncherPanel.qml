import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Services.Mpris
import qs.theme
import qs.services
import qs.widgets.bar
import qs.widgets.media
import qs.widgets.shared

// Results panel for the search island — port of AppLauncher.tsx.
// AGS renders a 3-column launcher: left = media Player card (300),
// center = Help / results (500), right = QuickApps (favorites) + AppHistory.
Rectangle {
    id: root

    implicitWidth: 300 + 500 + 300           // left + center + right
    implicitHeight: Math.max(400, contentColumn.height)
    radius: Theme.radius
    color: Theme.surface

    property int selectedIndex: 0

    // The 3-pane body
    Row {
        id: contentColumn
        anchors.fill: parent
        anchors.margins: 8
        spacing: 8

        // ---------- LEFT: media player card ----------
        Rectangle {
            width: 300
            height: parent.height
            radius: Theme.radius - 2
            color: Theme.bg
            clip: true
            MediaWidget {
                anchors.fill: parent
                anchors.margins: 6
            }
        }

        // ---------- CENTER: Help / results ----------
        Rectangle {
            width: 500
            height: parent.height
            radius: Theme.radius - 2
            color: Theme.bg
            clip: true

            // Help tips (mirrors AGS Help{}) — visible when query empty OR no results
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
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.leftMargin: 10
                        height: parent.height - 4
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
                    // layer-shell surfaces). Recent/Quick rows never had one.
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
        }

        // ---------- RIGHT: QuickApps + AppHistory ----------
        Rectangle {
            width: 300
            height: parent.height
            radius: Theme.radius - 2
            color: Theme.bg
            clip: true

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 10

                // QuickApps (favorites) — own smooth flickable
                Text {
                    text: "Quick Apps"
                    font.bold: true
                    font.pixelSize: Theme.fontSize + 2
                    color: Theme.fg
                    Layout.fillWidth: true
                }
                SmoothListView {
                    id: quickList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.preferredHeight: 180
                    Layout.minimumHeight: 80
                    clip: true
                    spacing: 4
                    focus: false
                    keyNavigationEnabled: false
                    model: Launcher.quickAppOrder.length > 0 ? Launcher.quickAppOrder : []
                    ScrollBar.vertical: ScrollBar {
                        policy: ScrollBar.AsNeeded
                    }
                    delegate: Rectangle {
                        required property var modelData
                        width: ListView.view.width
                        height: 46
                        radius: Theme.radius - 2
                        color: mouse.hovered ? Theme.surfaceHover : "transparent"
                        AppEntry {
                            anchors.fill: parent
                            anchors.leftMargin: 8
                            anchors.rightMargin: 8
                            entry: modelData
                            selected: mouse.hovered === true
                            compact: true
                        }
                        MouseArea {
                            id: mouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (modelData.launch) {
                                    Launcher.touchQuickApp(modelData.name);
                                    modelData.launch();
                                    BarState.deactivate("search");
                                }
                            }
                        }
                    }
                }

                // AppHistory (recent apps) — own smooth flickable
                Text {
                    text: "Recent Apps"
                    font.bold: true
                    font.pixelSize: Theme.fontSize + 2
                    color: Theme.fg
                    Layout.fillWidth: true
                }
                // Empty state (AGS AppHistory "Empty History" label)
                Text {
                    visible: Launcher.recentApps().length === 0
                    text: "Empty History"
                    font.pixelSize: Theme.fontSize - 1
                    color: Theme.muted
                    leftPadding: 8
                    Layout.fillWidth: true
                }
                SmoothListView {
                    id: recentList
                    visible: Launcher.recentApps().length > 0
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.preferredHeight: 180
                    Layout.minimumHeight: 80
                    clip: true
                    spacing: 4
                    focus: false
                    keyNavigationEnabled: false
                    model: Launcher.recentApps()
                    ScrollBar.vertical: ScrollBar {
                        policy: ScrollBar.AsNeeded
                    }
                    delegate: Rectangle {
                        required property var modelData
                        width: ListView.view.width
                        height: 42
                        radius: Theme.radius - 2
                        color: rmouse.hovered ? Theme.surfaceHover : "transparent"
                        AppEntry {
                            anchors.fill: parent
                            anchors.leftMargin: 8
                            anchors.rightMargin: 8
                            entry: modelData
                            selected: rmouse.hovered === true
                            compact: true
                        }
                        MouseArea {
                            id: rmouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (modelData.launch) {
                                    modelData.launch();
                                    BarState.deactivate("search");
                                }
                            }
                        }
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
            }
        }
    }
}
