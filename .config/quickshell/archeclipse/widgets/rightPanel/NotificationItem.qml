import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Widgets
import qs.theme
import qs.services
import qs.widgets.shared

// Single history card — same visuals as the NotificationPopups card
// (icon / side preview slot, title + time row, expandable body, action
// buttons, hover control buttons). Data comes from a history entry
// {id, time (epoch s, snapshot at receipt), notif (live object)}.
//
// Interactions:
//   - left-click anywhere on the card background copies the content
//     (image payload via wl-copy with its real MIME type, else text),
//   - right-click dismisses (removes it from history everywhere).
// The background MouseArea sits FIRST so the buttons above it stay
// clickable, and it lets presses through so the parent Flickable can
// still drag-scroll starting on the card.
Item {
    id: root
    property var entry: null
    readonly property var notification: entry ? entry.notif : null
    property bool bodyExpanded: false
    property bool isHovered: false

    // Snapshot receipt time (QS NotificationObject has no .time; popups use
    // toast.stamp the same way). Shown 24h %H:%M.
    readonly property double stamp: entry && entry.time ? entry.time : 0

    // ---- icon chain (Notifications service): appIcon path → appIcon theme
    // name → image path → image theme name → desktopEntry.
    // Recorder toasts show only the red dot, never a preview.
    readonly property bool isRecorder: Notifications.isRecorder(root.notification)
    readonly property bool critical: root.notification ? root.notification.urgency === 2 : false
    readonly property string iconFile: {
        if (!root.notification || root.isRecorder)
            return "";
        return Notifications.imageFile(root.notification);
    }
    readonly property string iconName: {
        if (!root.notification || root.isRecorder)
            return "";
        return Notifications.iconNameFor(root.notification);
    }
    readonly property string previewFile: {
        if (root.isRecorder || root.iconFile === "")
            return "";
        return Notifications.previewFor(root.iconFile);
    }
    readonly property string title: {
        if (!root.notification)
            return "";
        return ((root.notification.summary || root.notification.appName) || "").toString();
    }
    readonly property string bodyText: {
        if (!root.notification)
            return "";
        return ((root.notification.body) || "").toString();
    }
    readonly property bool hideBody: {
        if (root.bodyText === "")
            return true;
        return Notifications.bodyIsImage(root.notification, root.iconFile);
    }
    readonly property bool longBody: root.bodyText.length > 60 && !Notifications.bodyIsImage(root.notification, root.iconFile)

    height: card.height

    Rectangle {
        id: card
        width: parent.width
        // Content-driven: body is top-anchored inside the fill-item
        // shift, so this never feeds back into itself.
        height: body.height + 22
        Behavior on height {
            NumberAnimation {
                duration: 280
                easing.type: Easing.OutCubic
            }
        }
        radius: Theme.radius
        color: root.critical ? Qt.rgba(0.66, 0.27, 0.27, 0.95) : Theme.surface
        border.color: root.isHovered ? Qt.alpha(Theme.accent, 0.5) : Qt.alpha(Theme.fg, 0.1)
        border.width: 1
        Behavior on border.color {
            ColorAnimation {
                duration: 200
            }
        }
        clip: true

        // Background interaction layer FIRST so buttons above stay
        // clickable. Left-click copies, right-click dismisses.
        // Presses pass through so the parent Flickable keeps
        // press-drag scrolling when the gesture starts on the card.
        MouseArea {
            anchors.fill: parent
            acceptedButtons: Qt.LeftButton | Qt.RightButton
            cursorShape: Qt.PointingHandCursor
            propagateComposedEvents: true
            onPressed: mouse => mouse.accepted = false
            onClicked: mouse => {
                if (mouse.button === Qt.LeftButton)
                    root.copyContent();
                else if (mouse.button === Qt.RightButton)
                    root.dismiss();
            }
        }
        HoverHandler {
            onHoveredChanged: root.isHovered = hovered
        }

        // All content lifts as one unit on hover. Transforms only —
        // layout untouched.
        Item {
            id: shift
            anchors.fill: parent
            anchors.bottomMargin: 2
            scale: root.isHovered ? 1.012 : 1
            Behavior on scale {
                NumberAnimation {
                    duration: 220
                    easing.type: Easing.OutCubic
                }
            }

            Column {
                id: body
                anchors.top: parent.top
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.topMargin: 10
                anchors.leftMargin: 10
                anchors.rightMargin: 10
                spacing: 6

                Row {
                    id: contentRow
                    width: parent.width
                    spacing: 10

                    // ---- app icon / image: the image takes the icon's
                    // place, spanning the text height (72-120px) ----
                    Item {
                        id: iconSlot
                        readonly property bool showPreview: root.previewFile !== "" && previewImg.status !== Image.Error
                        readonly property real previewSize: Math.min(Math.max(textCol.height, 72), 120)
                        width: showPreview ? previewSize : 28
                        height: showPreview ? previewSize : 28
                        Behavior on width {
                            NumberAnimation {
                                duration: 250
                                easing.type: Easing.OutCubic
                            }
                        }
                        Behavior on height {
                            NumberAnimation {
                                duration: 250
                                easing.type: Easing.OutCubic
                            }
                        }
                        IconImage {
                            id: iconImg
                            visible: !parent.showPreview && status === Image.Ready && (root.iconFile !== "" || root.iconName !== "")
                            anchors.fill: parent
                            source: root.iconFile !== "" ? root.iconFile : root.iconName
                        }
                        Text {
                            visible: !iconImg.visible && !parent.showPreview
                            width: parent.width
                            height: parent.height
                            text: root.isRecorder ? "\uf111" : (root.critical ? "\u{F0266}" : "\u{F059A}")
                            color: root.isRecorder ? "#c95454" : (root.critical ? "white" : Theme.fg)
                            font.family: Theme.fontFamily
                            font.pixelSize: 22
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                        }
                        Rectangle {
                            visible: parent.showPreview
                            opacity: previewImg.status === Image.Ready ? 1 : 0
                            Behavior on opacity {
                                NumberAnimation {
                                    duration: 250
                                }
                            }
                            anchors.fill: parent
                            radius: 8
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
                                propagateComposedEvents: true
                                onPressed: mouse => mouse.accepted = false
                                onClicked: Quickshell.execDetached(["xdg-open", root.previewFile])
                            }
                        }
                    }

                    Column {
                        id: textCol
                        width: root.previewFile !== "" ? parent.width - 130 : parent.width - 38
                        Behavior on width {
                            NumberAnimation {
                                duration: 250
                                easing.type: Easing.OutCubic
                            }
                        }
                        spacing: 3

                        // ---- top bar: title + time (24h %H:%M) ----
                        RowLayout {
                            spacing: 6
                            width: parent.width
                            Text {
                                text: root.title
                                textFormat: Text.StyledText
                                elide: Text.ElideRight
                                Layout.fillWidth: true
                                color: root.critical ? "white" : Theme.fg
                                font.family: Theme.fontFamily
                                font.bold: true
                                font.pixelSize: Theme.fontSize
                            }
                            Text {
                                text: root.stamp > 0 ? new Date(root.stamp * 1000).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                }) : ""
                                color: root.critical ? Qt.alpha("white", 0.7) : Theme.fgDim
                                font.pixelSize: Theme.fontSize - 2
                                visible: text !== ""
                            }
                        }

                        // ---- body (expandable, markup handling) ----
                        // Hidden when it's just the image path — the
                        // image beside it already shows it.
                        Text {
                            width: parent.width
                            visible: !root.hideBody
                            text: root.bodyText
                            textFormat: Text.StyledText
                            wrapMode: Text.WordWrap
                            maximumLineCount: root.bodyExpanded ? undefined : 4
                            elide: root.bodyExpanded ? Text.ElideNone : Text.ElideRight
                            color: root.critical ? Qt.alpha("white", 0.85) : Theme.muted
                            font.family: Theme.fontFamily
                            font.pixelSize: Theme.fontSize - 1

                            // "more" hint when collapsed and truncated.
                            // TapHandler (not MouseArea) so press-drag still
                            // reaches the parent Flickable.
                            TapHandler {
                                gesturePolicy: TapHandler.ReleaseWithinBounds
                                onTapped: root.bodyExpanded = !root.bodyExpanded
                            }
                            HoverHandler {
                                cursorShape: Qt.PointingHandCursor
                            }
                        }
                    }
                }

                // ---- action buttons (all actions, invoke, NO dismiss) ----
                Row {
                    id: actionsRow
                    visible: root.notification ? Notifications.liveActions(root.notification).length > 0 : false
                    spacing: 4
                    Repeater {
                        model: root.notification ? Notifications.liveActions(root.notification) : []
                        delegate: AppButton {
                            required property var modelData
                            text: Notifications.actionLabel(modelData)
                            height: 24
                            pixelSize: Theme.fontSize - 2
                            cornerRadius: 4
                            idleBg: Theme.surface
                            outlined: true
                            onClicked: {
                                try {
                                    modelData.invoke();
                                } catch (e) {}
                            }
                        }
                    }
                }

                // ---- control buttons: copy, expand, dismiss ----
                Row {
                    id: buttonsRow
                    visible: root.isHovered
                    opacity: root.isHovered ? 1 : 0
                    Behavior on opacity {
                        NumberAnimation {
                            duration: 180
                        }
                    }
                    spacing: 4
                    AppButton {
                        icon: "󰃅"
                        pixelSize: 11
                        cornerRadius: 4
                        idleBg: Theme.surface
                        outlined: true
                        tooltipText: "Copy (left-click card)"
                        onClicked: root.copyContent()
                    }
                    AppButton {
                        icon: root.bodyExpanded ? "󰁾" : "󰁼"
                        pixelSize: 11
                        cornerRadius: 4
                        idleBg: Theme.surface
                        outlined: true
                        tooltipText: root.bodyExpanded ? "Collapse" : "Expand"
                        visible: root.longBody
                        onClicked: root.bodyExpanded = !root.bodyExpanded
                    }
                    AppButton {
                        icon: "󰀍"
                        pixelSize: 11
                        cornerRadius: 4
                        idleBg: Theme.surface
                        outlined: true
                        tooltipText: "Dismiss (right-click card)"
                        onClicked: root.dismiss()
                    }
                }
            }
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
        const content = root.bodyText || root.title;
        if (content) {
            Quickshell.execDetached(["wl-copy", content]);
        }
    }

    function dismiss() {
        try {
            if (root.notification)
                root.notification.dismiss();
        } catch (e) {}
    }
}
