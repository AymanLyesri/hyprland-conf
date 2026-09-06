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

    radius: Theme.radius
    color: "transparent"

    Image {
        id: img
        anchors.fill: parent
        asynchronous: true
        cache: true
        fillMode: Image.PreserveAspectCrop
        sourceSize.width: root.sourceWidth
    }
}
