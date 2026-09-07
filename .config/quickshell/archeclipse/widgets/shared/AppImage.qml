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
}
