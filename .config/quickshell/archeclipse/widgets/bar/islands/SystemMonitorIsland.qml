import QtQuick
import qs.services
import qs.widgets.shared

// System-monitor island — in-bar expansion of the ResourceMonitor rings.
// Content is shared with the right panel (SystemResourcesContent); this
// wrapper only adds island sizing + hover pinning so the pulse can't
// close it mid-read.
Item {
    id: root
    property int islandMargins: 5
    property int islandWidth: 440

    implicitWidth: islandWidth + islandMargins * 2
    implicitHeight: content.height + islandMargins * 2
    width: implicitWidth
    height: implicitHeight

    SystemResourcesContent {
        id: content
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: root.islandMargins
        width: root.islandWidth
    }

    // Pin while hovered so the pulse doesn't close it mid-read.
    HoverHandler {
        id: islandHover
        onHoveredChanged: {
            if (islandHover.hovered) {
                leaveTimer.stop();
                BarState.activate("system", 0);
            } else {
                leaveTimer.restart();
            }
        }
    }
    Timer {
        id: leaveTimer
        interval: 1000
        onTriggered: BarState.deactivate("system")
    }
    Component.onCompleted: leaveTimer.restart()
}
