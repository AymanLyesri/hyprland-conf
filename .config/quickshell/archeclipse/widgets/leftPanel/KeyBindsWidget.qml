import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Io
import qs.theme

// Key Binds widget — port of AGS KeyBinds.tsx + KeyBind.tsx
// Loads keybinds from ~/.config/ags/scripts/get-keybinds.sh (JSON),
// groups by category, renders each binding as an array of key chips
// joined by "+", per AGS.
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""

    // keybinds shape from get-keybinds.sh: { category: [{ description, keys: [] }] }
    property var keybinds: ({})
    property bool loading: true

    // ---- load keybinds from script (AGS execAsync get-keybinds.sh -> JSON.parse) ----
    Process {
        id: loadProc
        command: [Quickshell.env("HOME") + "/.config/ags/scripts/get-keybinds.sh"]
        running: true
        stdout: StdioCollector {
            onStreamFinished: {
                try {
                    const parsed = JSON.parse(text);
                    root.keybinds = parsed;
                } catch (e) {
                    console.warn("[KeyBindsWidget] Failed to parse get-keybinds.sh JSON:", text.slice(0, 200));
                }
                root.loading = false;
            }
        }
    }

    // sorted category names
    property var categories: Object.keys(root.keybinds).sort()

    // ---- UI: vertical category list exactly like AGS (no filter row) ----
    ColumnLayout {
        anchors.fill: parent
        spacing: 10

        Label {
            text: "Key Binds"
            font.pixelSize: Theme.fontSize + 4
            font.bold: true
            color: Theme.fg
            Layout.fillWidth: true
        }

        // Loading indicator (centered manually: parent is a layout,
        // which ignores anchors on children)
        BusyIndicator {
            running: root.loading
            Layout.alignment: Qt.AlignHCenter
            visible: root.loading
        }

        ScrollView {
            id: keyScroll
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            visible: !root.loading
            ScrollBar.vertical.policy: ScrollBar.AsNeeded

            Column {
                width: keyScroll.availableWidth
                spacing: 10

                Repeater {
                    model: root.categories
                    delegate: Column {
                        required property string modelData
                        property string category: modelData
                        width: parent.width
                        spacing: 5

                        Label {
                            text: category
                            font.pixelSize: Theme.fontSize
                            font.bold: true
                            color: Theme.fg
                            elide: Text.ElideRight
                            maximumLineCount: 1
                            width: parent.width
                        }

                        // binds within this category
                        Repeater {
                            model: root.keybinds[category] || []
                            delegate: Rectangle {
                                required property var modelData
                                property var bindKeys: modelData.keys || []
                                width: parent.width
                                color: "transparent"
                                height: 28
                                // NOTE: RowLayout — the description stretches,
                                // chips keep implicit size (verticalCenter
                                // anchors are ignored inside positioners).
                                RowLayout {
                                    anchors.fill: parent
                                    spacing: 10
                                    Label {
                                        text: modelData.description
                                        font.pixelSize: Theme.fontSize
                                        color: Theme.fg
                                        elide: Text.ElideRight
                                        maximumLineCount: 1
                                        Layout.fillWidth: true
                                    }

                                    // key chips joined by "+" (AGS KeyBind)
                                    Row {
                                        id: keysRow
                                        spacing: 3
                                        Layout.alignment: Qt.AlignVCenter
                                        Repeater {
                                            model: bindKeys
                                            delegate: Row {
                                                required property string modelData
                                                required property int index
                                                spacing: 3
                                                // Fixed height so "+" centers
                                                // deterministically.
                                                height: 22
                                                Rectangle {
                                                    width: kChip.implicitWidth + 10
                                                    height: 22
                                                    radius: 4
                                                    color: Theme.moduleBg

                                                    Label {
                                                        id: kChip
                                                        anchors.centerIn: parent
                                                        text: modelData
                                                        font.pixelSize: Theme.fontSize - 1
                                                        font.bold: true
                                                        color: Theme.accent
                                                        font.family: "JetBrainsMono NFP"
                                                    }
                                                }
                                                Label {
                                                    text: "+"
                                                    y: (parent.height - height) / 2
                                                    visible: index < (bindKeys.length - 1)
                                                    color: Theme.fgDim
                                                    font.pixelSize: Theme.fontSize
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
