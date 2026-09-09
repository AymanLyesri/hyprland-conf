import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.services
import qs.theme
import qs.widgets.shared

// Notification History widget ported from widgets/rightPanel/components/NotificationHistory.tsx
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""

    // Retained history (NOT the ephemeral toasts): entries survive popup
    // expiry exactly like AGS binding the daemon's notification list.
    // Entry shape: {id, time (epoch s), notif (live NotificationObject)}.
    property var notifications: Notifications.history
    property string filterText: ""
    property var expandedStacks: {}

    Connections {
        target: Notifications
        function onHistoryChanged() {
            // New arrival while pinned at the top: re-pin after polish so
            // the newest (first) notification is fully visible instead of
            // sitting half-clipped above the viewport.
            const wasTop = nScroll.contentY <= 1;
            root.notifications = Notifications.history;
            if (wasTop) {
                Qt.callLater(function () {
                    nScroll.contentY = 0;
                    nScroll.savedPosition = 0;
                });
            }
        }
    }

    function stackNotifications(notifications, filter) {
        const MAX_NOTIFICATIONS = 50;
        const stacks = new Map();

        const sorted = [...notifications].sort((a, b) => b.time - a.time);

        sorted.forEach(n => {
            const summary = (n.notif && n.notif.summary) || "";
            const appName = (n.notif && n.notif.appName) || "";
            if (filter && !summary.includes(filter) && !appName.includes(filter))
                return;

            const key = summary || "Unknown";
            if (!stacks.has(key))
                stacks.set(key, []);
            stacks.get(key).push(n);
        });

        const result = [...stacks.entries()].map(([title, notifications]) => ({
                    title,
                    notifications
                }));

        // Flatten manually since flatMap might not be available
        const flat = [];
        result.forEach(s => s.notifications.forEach(n => flat.push(n)));
        flat.slice(MAX_NOTIFICATIONS).forEach(n => {
            try {
                n.notif.dismiss();
            } catch (e) {}
        });

        return result;
    }

    property var stackedNotifications: stackNotifications(notifications, filterText)

    // Natural height for embedders (RightPanel card): header + list
    // (capped — internal scroll takes over past the cap) + empty hint +
    // filter + spacing/margins. The list measures real delegate heights
    // instead of guessing per-notification pixels.
    readonly property real maxListH: 380
    readonly property real listH: stackedNotifications.length === 0 ? 0 : Math.min(listColumn.height, maxListH)
    implicitHeight: headerLabel.implicitHeight + listH + emptyHint.height + filterField.implicitHeight + mainCol.spacing * 3 + 16

    Column {
        id: mainCol
        anchors.fill: parent
        anchors.margins: 8
        spacing: 8

        // Header title only — filter lives at the bottom.
        Label {
            id: headerLabel
            text: "Notification History"
            font.pixelSize: Theme.fontSize + 4
            font.bold: true
            color: Theme.fg
            width: parent.width
            elide: Text.ElideRight
        }

        // Notification List — fills the leftover card space (same pattern
        // as Crypto/ScriptTimer: height from parent remainder, NOT from the
        // measured content). Sizing the viewport from content height while
        // the outer card sizes itself from our implicitHeight clipped the
        // first delegate and could push the filter field out of the card.
        SmoothFlickable {
            id: nScroll
            width: parent.width
            // Guarded: a negative height sends Flickable into a silent polish loop
            height: stackedNotifications.length === 0 ? 0 : Math.max(0, parent.height - y - 8)
            visible: stackedNotifications.length > 0
            clip: true
            flickableDirection: Flickable.VerticalFlick
            contentWidth: width
            contentHeight: listColumn.height
            ScrollBar.vertical: ScrollBar {
                policy: ScrollBar.AsNeeded
            }

            // Scroll position save/restore across notification changes
            // (AGS NotificationHistory savedScrollPosition + idle_add).
            property real savedPosition: 0
            onContentYChanged: {
                nScroll.savedPosition = contentY;
            }
            onContentHeightChanged: {
                // model updated → restore (clamped) scroll position
                Qt.callLater(function () {
                    const max = Math.max(0, nScroll.contentHeight - nScroll.height);
                    nScroll.contentY = Math.min(nScroll.savedPosition, max);
                });
            }

            Column {
                id: listColumn
                width: parent.width
                spacing: 8

                Repeater {
                    model: stackedNotifications
                    delegate: StackItem {
                        width: parent.width
                        stack: modelData
                        expandedStacks: root.expandedStacks
                        onToggleExpanded: {
                            const newStacks = Object.assign({}, root.expandedStacks);
                            newStacks[modelData.title] = !newStacks[modelData.title];
                            root.expandedStacks = newStacks;
                        }
                        onClearStack: {
                            modelData.notifications.forEach(n => n.notif.dismiss());
                        }
                    }
                }
            }
        }

        // Empty state — small fixed hint, no blank scroll area.
        Text {
            id: emptyHint
            width: parent.width
            visible: stackedNotifications.length === 0
            height: visible ? implicitHeight : 0
            text: filterText !== "" ? "No matching notifications" : "No notifications"
            font.pixelSize: Theme.fontSize
            color: Theme.fgDim
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
        }

        AppTextField {
            id: filterField
            width: parent.width
            placeholderText: "Filter..."
            text: root.filterText
            onTextChanged: root.filterText = text
        }
    }
}
