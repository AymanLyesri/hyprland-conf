import QtQuick
import Quickshell
import qs.services
import qs.theme

// Port of Utilities.tsx ControlPanelButton — toggles the control island
// (quick settings) in the bar pill.
Rectangle {
    id: root

    width: 24; height: 20
    radius: Theme.radius
    color: mouse.containsMouse ? Theme.buttonHoverBg : "transparent"

    Text {
        anchors.centerIn: parent
        text: "\u{F15FC}"
        color: Theme.foreground
        font.family: Theme.fontFamily
        font.pixelSize: Theme.fontSize + 1
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            // Toggle the control island in the bar pill.
            if (BarState.state === "control") BarState.deactivate("control");
            else BarState.activate("control", 0);
        }
    }
}