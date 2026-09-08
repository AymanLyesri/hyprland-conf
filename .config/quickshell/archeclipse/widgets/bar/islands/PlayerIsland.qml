import QtQuick
import qs.theme
import qs.services
import qs.widgets.media

// Player island now shows the full MediaWidget (cover art, track info,
// controls, seek bar) instead of the old title-only ticker.
// Size derives from the MediaWidget's implicit size — no hardcoded
// width/height here.
Item {
    id: root
    property int islandMargins: 4

    implicitWidth: media.implicitWidth + islandMargins * 2
    implicitHeight: media.implicitHeight + islandMargins * 2
    width: implicitWidth
    height: implicitHeight

    MediaWidget {
        id: media
        anchors.fill: parent
        anchors.margins: root.islandMargins
    }

    // Pin while hovered so the 2.5s pulse doesn't close it mid-interaction.
    HoverHandler {
        id: islandHover
        onHoveredChanged: {
            if (islandHover.hovered) {
                leaveTimer.stop();
                BarState.activate("player", 0);
            } else {
                leaveTimer.restart();
            }
        }
    }
    Timer {
        id: leaveTimer
        interval: 1000
        onTriggered: BarState.deactivate("player")
    }
    Component.onCompleted: leaveTimer.restart()
}
