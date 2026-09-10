import QtQuick
import qs.theme
import qs.services

// Port of widgets/bar/components/sub-components/KeyboardLayout.tsx
// Shows current keyboard layout, click to cycle, right-click to show flag emoji.
// Width follows the content (tight 4px padding per side), collapsing to
// nothing when no layout is reported.
Item {
    id: root
    height: Theme.barContentHeight
    width: label.visible ? label.implicitWidth + 8 : 0
    visible: label.visible

    property bool showFlag: false

    Text {
        id: label
        anchors.centerIn: parent
        text: root.showFlag ? (KeyboardLayout.flagEmoji(KeyboardLayout.layout) || KeyboardLayout.layout) : KeyboardLayout.layout
        visible: KeyboardLayout.layout.length > 0
        color: Theme.fg
        font.family: Theme.fontFamily
        font.pixelSize: Theme.fontSize
    }

    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            if (mouse.button === Qt.RightButton) {
                root.showFlag = !root.showFlag;
            } else if (mouse.button === Qt.LeftButton) {
                KeyboardLayout.nextLayout();
            }
        }
    }
}
