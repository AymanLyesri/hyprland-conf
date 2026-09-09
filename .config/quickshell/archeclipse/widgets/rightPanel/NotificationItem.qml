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
    // name → image path → image theme name → desktopEntry → urgency fallback.
    // Values may be plain paths or file:// URLs (see
    // Notifications.iconToFile). Recording toasts show only the red dot.
    readonly property bool isRecorder: Notifications.isRecorder(root.notification)
    readonly property string iconFile: {
        if (!root.notification || root.isRecorder)
            return "";
        return Notifications.imageFile(root.notification);
    }
    readonly property string iconName: {
        if (!root.notification || root.isRecorder)
            return "";
        const n = root.notification;
        const vals = [n.appIcon, n.image];
        for (let i = 0; i < vals.length; ++i) {
            const s = vals[i] ? String(vals[i]) : "";
            if (s !== "" && Notifications.iconToFile(s) === "")
                return s;
        }
        if (n.desktopEntry)
            return n.desktopEntry;
        return "";
    }

    // Large preview for file-path icons (screenshots, etc.). Collapses to
    // 0 height when there is no image file or the format can't load.
    // Recording toasts never preview — red dot icon only.
    readonly property string previewFile: {
        if (root.isRecorder || root.iconFile === "")
            return "";
        if (!/\.(png|jpe?g|webp|gif|bmp|svg|ico)$/i.test(root.iconFile))
            return "";
        return root.iconFile;
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
                    visible: root.isRecorder || root.iconFile !== "" || root.iconName !== "" || (root.notification && root.notification.urgency === 2)
                    IconImage {
                        anchors.fill: parent
                        anchors.margins: 1
                        source: root.iconFile !== "" ? root.iconFile : root.iconName
                        visible: status === Image.Ready && (root.iconFile !== "" || root.iconName !== "")
                    }
                    Text {
                        anchors.fill: parent
                        visible: root.iconFile === "" && root.iconName === ""
                        text: root.isRecorder ? "" : "\u{F059A}"
                        font.pixelSize: 16
                        color: root.isRecorder ? "#c95454" : Theme.accent
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
                    icon: "\uf0c5"
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
                    icon: root.bodyExpanded ? "\udb81\ude15" : "\udb81\ude16"
                    width: 24
                    height: 24
                    pixelSize: 11
                    cornerRadius: 4
                    idleBg: Theme.surface
                    outlined: true
                    visible: root.notification && root.notification.body && root.notification.body.length > 100 && !Notifications.bodyIsImage(root.notification, root.iconFile)
                    onClicked: root.bodyExpanded = !root.bodyExpanded
                }

                AppButton {
                    icon: "\uf00d"
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

            // Body (expandable, AGS markup handling). Hidden when it's
            // just the image path — the preview below already shows it.
            Text {
                text: (root.notification && root.notification.body) || ""
                textFormat: Text.StyledText
                font.pixelSize: Theme.fontSize - 1
                color: Theme.fgDim
                width: parent.width
                wrapMode: Text.WordWrap
                maximumLineCount: root.bodyExpanded ? undefined : 3
                elide: root.bodyExpanded ? Text.ElideNone : Text.ElideRight
                visible: text !== "" && !Notifications.bodyIsImage(root.notification, root.iconFile)

                // "more" hint when collapsed and truncated.
                // TapHandler (not MouseArea) so press-drag still reaches
                // the parent Flickable — a covering MouseArea would swallow
                // drags and break list scrolling starting on the body.
                TapHandler {
                    gesturePolicy: TapHandler.ReleaseWithinBounds
                    onTapped: root.bodyExpanded = !root.bodyExpanded
                }
                HoverHandler {
                    cursorShape: Qt.PointingHandCursor
                }
            }

            // Image preview (screenshots): click to open. Square spanning
            // the full width; innerCol height follows content, so the
            // card grows automatically.
            Rectangle {
                width: parent.width
                height: root.previewFile !== "" && previewImg.status !== Image.Error ? width : 0
                visible: height > 0
                radius: 6
                clip: true
                color: Qt.alpha(Theme.fg, 0.06)
                Image {
                    id: previewImg
                    anchors.fill: parent
                    source: root.previewFile !== "" ? "file://" + root.previewFile : ""
                    asynchronous: true
                    cache: false
                    fillMode: Image.PreserveAspectCrop
                }
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    // Let the Flickable drag too: only claim the press when
                    // it actually ends as a click on the preview.
                    propagateComposedEvents: true
                    onPressed: mouse => mouse.accepted = false
                    onClicked: Quickshell.execDetached(["xdg-open", root.previewFile])
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

        // Hover only — a covering MouseArea here would sit on top of the
        // copy/expand/dismiss buttons AND swallow press-drags, breaking
        // both button clicks and Flickable scrolling starting on the card.
        HoverHandler {
            onHoveredChanged: root.isHovered = hovered
        }
    }

    function copyContent() {
        const n = root.notification;
        if (!n)
            return;
        // Screenshot icons arrive as appIcon paths — copy with the real
        // MIME type instead of mislabeling everything as image/png.
        if (root.iconFile !== "") {
            const imgPath = root.iconFile;
            const p = Qt.createQmlObject("import Quickshell.Io; Process {}", root);
            p.command = ["bash", "-c", "wl-copy --type \"$(file -b --mime-type " + JSON.stringify(imgPath) + ")\" < " + JSON.stringify(imgPath)];
            p.exited.connect(code => {
                if (code === 0)
                    Notifications.notify({
                        summary: "Copied",
                        body: imgPath
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
