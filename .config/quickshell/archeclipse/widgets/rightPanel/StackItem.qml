import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.theme
import qs.widgets.shared

// Notification Stack Item component
Item {
    id: root
    property var stack: {}
    property var expandedStacks: {}
    signal toggleExpanded()
    signal clearStack()

    property bool isExpanded: !!(stack && stack.title && expandedStacks && expandedStacks[stack.title] === true)

    // Height follows content (header + loaded stack body). The column is
    // top-anchored, never fill-anchored: no height feedback loop.
    height: stackCol.height

    // Fade-in on arrival (NotificationPopups parity).
    opacity: 0
    Component.onCompleted: opacity = 1
    Behavior on opacity {
        NumberAnimation {
            duration: 250
            easing.type: Easing.OutCubic
        }
    }

    Column {
        id: stackCol
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        spacing: 0

        // Header (RowLayout: the title takes leftover width and elides —
        // a plain Row let long summaries run past the parent).
        RowLayout {
            width: parent.width
            spacing: 5
            Label {
                id: titleLabel
                text: stack ? "(" + stack.notifications.length + ") " + stack.title : ""
                font.pixelSize: Theme.fontSize
                color: Theme.fg
                elide: Text.ElideRight
                Layout.fillWidth: true
            }

            Row {
                spacing: 5
                // Expand chevron only for multi-item stacks; the clear button
                // ALWAYS renders (AGS ClearNotifications, no length guard).
                AppButton {
                    visible: stack.notifications.length > 1
                    icon: isExpanded ? "\u{f106}" : "\u{f107}"
                    pixelSize: Theme.fontSize - 2
                    cornerRadius: 4
                    onClicked: root.toggleExpanded()
                }
                AppButton {
                                    icon: "\u{f014}"
                                    pixelSize: Theme.fontSize - 2
                                    cornerRadius: 4
                                    tooltipText: "Clear all"
                                    onClicked: root.clearStack()
                                }
            }
        }

        // Content
        Loader {
            width: parent.width
            height: item ? item.height : 0
            sourceComponent: isExpanded ? expandedContent : collapsedContent
        }
    }

    Component {
        id: collapsedContent
        NotificationItem {
            // Loader parents the loaded item, so parent.width is valid here.
            width: parent.width
            entry: stack.notifications[0]
        }
    }

    Component {
        id: expandedContent
        Column {
            width: parent.width
            spacing: 5
            height: childrenRect.height
            Repeater {
                model: stack.notifications
                delegate: NotificationItem {
                    width: parent.width
                    entry: modelData
                }
            }
        }
    }
}