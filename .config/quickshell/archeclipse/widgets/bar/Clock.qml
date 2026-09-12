import QtQuick
import Quickshell
import qs.theme
import qs.services

// Time always visible; hovering reveals the long date. Tight margins: 4px
// padding each side, 6px between time and date.
Rectangle {
    id: root

    width: row.implicitWidth
    height: Theme.barContentHeight
    radius: Theme.radius
    // Hover fill — set to "transparent" when embedded on an already-filled
    // surface (e.g. the DefaultBar center pill) so the revealed date never
    // paints a mismatched block behind it.
    property string hoverColor: Theme.surfaceHover
    color: hover.hovered ? hoverColor : "transparent"

    property string timeText: Settings.fmt(new Date(), Settings.dateFormat)
    SystemClock {
        precision: SystemClock.Minutes
        onDateChanged: root.timeText = Settings.fmt(new Date(), Settings.dateFormat)
    }

    Behavior on color {
        ColorAnimation {
            duration: 200
        }
    }

    Row {
        id: row
        anchors.centerIn: parent
        spacing: 6

        Text {
            id: clockLabel
            anchors.verticalCenter: parent.verticalCenter
            text: root.timeText
            color: Theme.fg
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize
        }

        // Revealer: clipped date expands on hover, collapses on leave.
        Item {
            id: dateClip
            anchors.verticalCenter: parent.verticalCenter
            width: hover.hovered ? dateText.implicitWidth : 0
            height: dateText.implicitHeight
            clip: true
            visible: width > 0

            Behavior on width {
                NumberAnimation {
                    duration: 250
                    easing.type: Easing.InOutQuad
                }
            }

            Text {
                id: dateText
                anchors.verticalCenter: parent.verticalCenter
                text: Qt.formatDate(new Date(), "dddd · d MMM")
                color: Theme.muted
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize
            }
        }
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            const idx = Settings.dateFormats.indexOf(Settings.dateFormat);
            const next = Settings.dateFormats[(idx + 1) % Settings.dateFormats.length];
            Settings.dateFormat = next;
            root.timeText = Settings.fmt(new Date(), next);
        }
    }

    HoverHandler {
        id: hover
    }
}
