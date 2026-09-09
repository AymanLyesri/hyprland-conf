import QtQuick
import QtQuick.Controls
import QtQuick.Window
import Quickshell.Hyprland
import qs.theme
import qs.services
import qs.widgets.bar

// Workspaces (full, grouped): workspaces 1..max(existing,10); occupied ones
// are grouped into a pill ("workspace-group active"), empties stand alone.
// Focused = highlighted, inactive = 0.4 opacity. Click dispatches focus.
// Special-workspace toggle on the left.
Row {
    id: root

    spacing: Theme.spacing

    // snapshot of workspace state: [{id, exists, icon}]
    readonly property var wsModel: {
        Hyprland.workspaces.values;      // reactive dep
        const focused = Hyprland.focusedWorkspace?.id;
        const map = new Map();
        for (const w of Hyprland.workspaces.values) {
            let icon = WorkspaceIcons.extraIcon;
            const tops = Hyprland.toplevels.values.filter(t => t.workspace?.id === w.id);
            if (tops.length > 0)
                icon = WorkspaceIcons.forClientClass(tops[0].lastIpcObject?.class ?? "");
            map.set(w.id, {
                id: w.id,
                exists: true,
                icon
            });
        }
        const maxId = Math.max(10, ...map.keys());
        const out = [];
        for (let i = 1; i <= maxId; i++) {
            out.push(map.get(i) ?? {
                id: i,
                exists: false,
                icon: WorkspaceIcons.emptyIcon
            });
        }
        return out.slice(0, maxId);
    }

    // AGS parity (variables.ts): specialWorkspace = focusedClient.workspace.id < 0.
    // Quickshell: Hyprland.activeToplevel is the focused client (HyprlandToplevel).
    // focusedWorkspace stays on the normal workspace while special is open
    // (activeworkspace=1, activewindow on -99), so checking focusedWorkspace
    // alone never toggles. Also consider an open-but-unfocused special via
    // workspaces active flag.
    readonly property bool specialActive: {
        Hyprland.activeToplevel?.workspace?.id;
        Hyprland.focusedWorkspace?.id;
        Hyprland.workspaces.values;
        const activeWsId = Hyprland.activeToplevel?.workspace?.id;
        if ((activeWsId ?? 1) < 0)
            return true;
        if ((Hyprland.focusedWorkspace?.id ?? 1) < 0)
            return true;
        for (const w of Hyprland.workspaces.values) {
            if ((w.id ?? 1) < 0 && w.active)
                return true;
        }
        return false;
    }

    // ---- special workspace button ----
    Rectangle {
        radius: Theme.radius
        color: root.specialActive ? Theme.surfaceActive : "transparent"
        width: specialLabel.implicitWidth + 12
        height: parent.height - 6
        anchors.verticalCenter: parent.verticalCenter

        Behavior on color {
            ColorAnimation {
                duration: 200
            }
        }

        Text {
            id: specialLabel
            anchors.centerIn: parent
            text: WorkspaceIcons.specialIcon
            color: Theme.fg
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize
        }
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: Hyprland.dispatch("hl.dsp.workspace.toggle_special()")
        }
    }

    // ---- grouped workspaces ----
    Row {
        spacing: 0

        Repeater {
            model: root.wsModel

            Rectangle {
                id: btn
                required property var modelData
                readonly property int wid: modelData.id
                readonly property bool exists: modelData.exists
                readonly property bool focused: (Hyprland.focusedWorkspace?.id ?? 1) === wid

                radius: Theme.radius
                color: focused ? Theme.surfaceActive : "transparent"
                opacity: !exists ? 0.4 : 1.0
                implicitWidth: label.implicitWidth + (focused ? 32 : 8)
                implicitHeight: 24

                Behavior on color {
                    ColorAnimation {
                        duration: 300
                    }
                }
                Behavior on implicitWidth {
                    NumberAnimation {
                        duration: 300
                        easing.type: Easing.OutCubic
                    }
                }
                Behavior on opacity {
                    NumberAnimation {
                        duration: 300
                    }
                }

                Text {
                    id: label
                    anchors.centerIn: parent
                    textFormat: Text.RichText
                    text: Settings.workspaceNumbers ? modelData.icon + WorkspaceIcons.numberBadge(btn.wid) : modelData.icon
                    color: Theme.fg
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: Hyprland.dispatch(`hl.dsp.focus({workspace=${btn.wid}})`)
                }
            }
        }
    }
}
