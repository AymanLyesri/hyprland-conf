import QtQuick
import Quickshell.Widgets
import qs.theme

ClippingRectangle {
    id: root

    property alias source: img.source
    property alias fillMode: img.fillMode
    property alias status: img.status
    property alias implicitImageWidth: img.implicitWidth
    property alias implicitImageHeight: img.implicitHeight
    property int sourceWidth: 0
    // Optional fallback (e.g. original file when thumbnail is missing).
    // If the main source fails to load, automatically retry once with this.
    property string fallbackSource: ""
    property bool __fallbackUsed: false
    // Unified badge overlay (top-right). Callers feed icon strings, e.g.
    // badges: [video ? "\uf03d" : "", bookmarked ? "\uf02e" : ""].filter(x => x !== "")
    property var badges: []

    radius: Theme.radius
    color: "transparent"

    Image {
        id: img
        anchors.fill: parent
        asynchronous: true
        cache: true
        fillMode: Image.PreserveAspectCrop
        sourceSize.width: root.sourceWidth
        onSourceChanged: root.__fallbackUsed = false
        onStatusChanged: {
            if (status === Image.Error && !root.__fallbackUsed && root.fallbackSource !== "" && source != root.fallbackSource) {
                root.__fallbackUsed = true;
                source = root.fallbackSource;
            }
        }
    }

    Row {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: 4
        spacing: 4
        visible: root.badges.length > 0
        Repeater {
            model: root.badges
            delegate: Rectangle {
                required property string modelData
                width: 24
                height: 18
                radius: Theme.radius
                color: Theme.accent
                visible: modelData !== ""
                Text {
                    anchors.centerIn: parent
                    text: parent.modelData
                    font.pixelSize: 9
                    font.family: Theme.fontFamily
                    color: "white"
                }
            }
        }
    }
}
