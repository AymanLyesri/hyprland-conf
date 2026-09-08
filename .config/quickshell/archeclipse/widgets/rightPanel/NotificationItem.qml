import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets
import qs.theme
import qs.services
import qs.widgets.shared

// Single Notification Item component — port of NotificationWidget from
// widgets/rightPanel/components/Notification.tsx. Shows app name/icon, summary,
// body text with expand/collapse, copy-to-clipboard, notification actions,
// and dismiss button.
//
// Props: `entry` = {id, time (epoch s, snapshot at receipt), notif (live
// NotificationObject)}. All display fields read the live object; dismiss and
// action-invoke act on it directly (AGS: n.dismiss(), n.invoke(action.id)).
Item {
    id: root
    property var entry: null
    readonly property var notification: entry ? entry.notif : null
    property bool isHovered: false
    property bool bodyExpanded: false

    // Snapshot receipt time (QS NotificationObject has no .time; AGS shows
    // 24h %H:%M from GLib DateTime).
    readonly property double notifTime: entry && entry.time ? entry.time : 0

    // Height follows content (the inner Column is top-anchored, never
    // fill-anchored, so there is no height feedback loop).
    height: innerCol.height + 16

    // ---- icon chain (AGS getNotificationIcon): appIcon path → appIcon theme
    // name → image path → image theme name → desktopEntry → urgency fallback
    readonly property string iconFile: {
        const n = root.notification;
        if (!n)
            return "";
        if (n.appIcon && String(n.appIcon).startsWith("/"))
            return n.appIcon;
        if (n.image && String(n.image).startsWith("/"))
            return n.image;
        return "";
    }
    readonly property string iconName: {
        const n = root.notification;
        if (!n)
            return "";
        if (n.appIcon && !String(n.appIcon).startsWith("/"))
            return n.appIcon;
        if (n.image && !String(n.image).startsWith("/"))
            return n.image;
        if (n.desktopEntry)
            return n.desktopEntry;
        return "";
    }

    Rectangle {
        anchors.fill: parent
        color: Theme.surface
        radius: Theme.radius

        clip: true

        Column {
            id: innerCol
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.topMargin: 8
            anchors.leftMargin: 8
            anchors.rightMargin: 8
            spacing: 4

            // Top bar: app name, icon, time, copy, expand, dismiss
            // (RowLayout: the app name takes leftover width and elides —
            // a plain Row with a dead Layout.fillWidth spacer overflowed).
            RowLayout {
                width: parent.width
                spacing: 6

                Item {
                    id: appIconWrap
                    width: 20
                    height: 20
                    visible: root.iconFile !== "" || root.iconName !== "" || (root.notification && root.notification.urgency === 2)
                    IconImage {
                        anchors.fill: parent
                        anchors.margins: 1
                        source: root.iconFile !== "" ? root.iconFile : root.iconName
                        visible: status === Image.Ready && (root.iconFile !== "" || root.iconName !== "")
                    }
                    Text {
                        anchors.fill: parent
                        visible: root.iconFile === "" && root.iconName === ""
                        text: "\u{F059A}"
                        font.pixelSize: 16
                        color: Theme.accent
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                }

                Text {
                    id: appNameLabel
                    text: (root.notification && root.notification.appName) || "Unknown"
                    font.pixelSize: Theme.fontSize
                    font.bold: true
                    color: Theme.accent
                    Layout.fillWidth: true
                    elide: Text.ElideRight
                }

                // Time — 24h %H:%M like AGS utils/time.ts
                Text {
                    id: timeLabel
                    text: root.notifTime > 0 ? new Date(root.notifTime * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    }) : ""
                    font.pixelSize: Theme.fontSize - 1
                    color: Theme.fgDim
                    visible: text !== ""
                }

                // Copy to clipboard (AGS copyNotificationContent: image payload
                // via wl-copy --type image/png with Copied/Error toast, else text)
                AppButton {
                    id: copyBtn
                    icon: "󰃅"
                    width: 24
                    height: 24
                    pixelSize: 11
                    cornerRadius: 4
                    idleBg: Theme.surface
                    outlined: true
                    tooltipText: "Copy text"
                    visible: root.isHovered
                    onClicked: root.copyContent()
                }

                // Expand/collapse body
                AppButton {
                    id: expandBtn
                    icon: root.bodyExpanded ? "󰁾" : "󰁼"
                    width: 24
                    height: 24
                    pixelSize: 11
                    cornerRadius: 4
                    idleBg: Theme.surface
                    outlined: true
                    visible: root.notification && root.notification.body && root.notification.body.length > 100
                    onClicked: root.bodyExpanded = !root.bodyExpanded
                }

                // Dismiss (AGS dismissNotification → n.dismiss())
                AppButton {
                    icon: "󰀍"
                    width: 24
                    height: 24
                    pixelSize: 11
                    cornerRadius: 4
                    idleBg: Theme.surface
                    outlined: true
                    tooltipText: "Dismiss"
                    onClicked: {
                        try {
                            if (root.notification)
                                root.notification.dismiss();
                        } catch (e) {}
                    }
                }
            }

            // Summary (AGS: Pango markup validated, escaped when invalid)
            Text {
                text: (root.notification && root.notification.summary) || ""
                textFormat: Text.StyledText
                font.pixelSize: Theme.fontSize
                font.bold: true
                color: Theme.fg
                width: parent.width
                wrapMode: Text.WordWrap
            }

            // Body (expandable, AGS markup handling)
            Text {
                text: (root.notification && root.notification.body) || ""
                textFormat: Text.StyledText
                font.pixelSize: Theme.fontSize - 1
                color: Theme.fgDim
                width: parent.width
                wrapMode: Text.WordWrap
                maximumLineCount: root.bodyExpanded ? undefined : 3
                elide: root.bodyExpanded ? Text.ElideNone : Text.ElideRight
                visible: text !== ""

                // "more" hint when collapsed and truncated
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: root.bodyExpanded = !root.bodyExpanded
                }
            }

            // Notification action buttons (AGS getActions: ALL actions kept,
            // invoke WITHOUT dismiss, label = last ":" segment).
            // RowLayout with fill buttons: many/long actions share the
            // width instead of running past the parent.
            RowLayout {
                width: parent.width
                spacing: 6
                visible: (root.notification && Notifications.liveActions(root.notification).length) > 0
                Repeater {
                    model: root.notification ? Notifications.liveActions(root.notification) : []
                    delegate: AppButton {
                        required property var modelData
                        text: Notifications.actionLabel(modelData)
                        Layout.fillWidth: true
                        height: 24
                        pixelSize: Theme.fontSize - 2
                        cornerRadius: 4
                        idleBg: Theme.surfaceActive
                        idleFg: Theme.accent
                        outlined: true
                        outlineColor: Theme.accent
                        onClicked: {
                            try {
                                modelData.invoke();
                            } catch (e) {}
                        }
                    }
                }
            }
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            onEntered: root.isHovered = true
            onExited: root.isHovered = false
        }
    }

    function copyContent() {
        const n = root.notification;
        if (!n)
            return;
        if (n.image && String(n.image).startsWith("/")) {
            const p = Qt.createQmlObject("import Quickshell.Io; Process {}", root);
            p.command = ["bash", "-c", "wl-copy --type image/png < " + JSON.stringify(n.image)];
            p.exited.connect(code => {
                if (code === 0)
                    Notifications.notify({
                        summary: "Copied",
                        body: n.image
                    });
                else
                    Notifications.notify({
                        summary: "Error",
                        body: "Copy failed"
                    });
                p.destroy();
            });
            p.running = true;
            return;
        }
        const content = n.body || n.appName || "";
        if (content) {
            Quickshell.execDetached(["wl-copy", content]);
        }
    }
}
