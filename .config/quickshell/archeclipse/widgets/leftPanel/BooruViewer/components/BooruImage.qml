import QtQuick
import QtQuick.Controls
import qs.services
import qs.theme
import qs.widgets.shared

// One masonry grid card (extracted from BooruViewerWidget imgCardComp).
// viewer: entry root (gridSource, tag predicates, dialog open).
Rectangle {
    id: card

    property var viewer
    required property var image
    property bool isVideo: ["mp4", "webm", "mkv", "gif"].includes(((image && image.extension) || "").toLowerCase())

    width: parent ? parent.width : 0
    height: image && image.width && image.height ? Math.max(80, width * image.height / image.width) : width
    color: Theme.surface
    radius: 10
    clip: true
    // Staggered pop-in: the viewer reveals one id per tick (see
    // _revealTimer); the card fades/scales in only once its file is
    // decoded (Image.Ready) AND its turn arrived. Videos skip the
    // image gate since they show a badge, not a bitmap.
    readonly property bool imgReady: previewImg.status === Image.Ready
    readonly property bool turnArrived: viewer && typeof viewer.isRevealed === "function" ? viewer.isRevealed(image) : true
    readonly property bool popped: card.isVideo ? turnArrived : (turnArrived && imgReady)
    opacity: popped ? 1 : 0
    scale: popped ? 1 : 0.97
    Behavior on opacity {
        NumberAnimation {
            duration: 280
            easing.type: Easing.OutCubic
        }
    }
    Behavior on scale {
        NumberAnimation {
            duration: 280
            easing.type: Easing.OutCubic
        }
    }
    ToolTip.visible: imgMa.containsMouse
    ToolTip.text: image ? ("Click to Open\nID: " + image.id + "  " + image.width + "x" + image.height + "\nRight-click: Set as waifu") : ""

    // Preview image (or placeholder). AGS renders the
    // downloaded local preview; prefer the local file once
    // cached instead of re-downloading the remote URL.
    AppImage {
        id: previewImg
        anchors.fill: parent

        source: viewer.gridSource(image)
        visible: !card.isVideo
    }

    // Video indicator
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        width: 16
        height: 16
        radius: 8
        color: Theme.accent
        visible: card.isVideo

        Text {
            text: "\u{f03d}" // video icon
            color: "white"
            font.pixelSize: 10
            anchors.centerIn: parent
        }
    }

    MouseArea {
        id: imgMa

        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        onClicked: mouse => {
            if (mouse.button === Qt.RightButton) {
                // Right-click: set as waifu (AGS renderAsWaifuWidget)
                Settings.waifu = image;
                Settings.persist();
            } else {
                // Left-click: float the detail card at this card's Y
                // (viewer captures the anchor + opens the island).
                viewer.openDialog(image, card);
            }
        }
    }

    // Pinned / bookmarked / waifu badges (AGS info icons)
    Rectangle {
        anchors.top: card.top
        anchors.left: card.left
        anchors.margins: 6
        height: 16
        width: infoBadges.implicitWidth + 8
        radius: 8
        color: Theme.accent
        visible: viewer.isInfoTagged(image)

        Row {
            id: infoBadges

            anchors.centerIn: parent
            spacing: 3

            Text {
                text: viewer.isPinned(image) ? "\u{f96c}" : "\u{f02e}"
                color: "white"
                font.pixelSize: 9
            }

            Text {
                text: viewer.isCurrentWaifu(image) ? "\u{f004}" : ""
                color: "white"
                font.pixelSize: 9
            }
        }
    }
}
