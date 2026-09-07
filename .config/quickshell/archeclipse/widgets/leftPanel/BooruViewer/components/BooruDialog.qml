import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.theme
import qs.widgets.shared
import qs.services
import qs.widgets.media

// Floating detail card shown in a PopupWindow docked to the panel edge.
// The popup sizes us (width/height); we report our natural height back so
// the viewer can center/clamp on the anchor card. Entrance is slide/fade
// on the inner wrapper only — never layout geometry.
// viewer: entry root (dialogImage, download/bookmark/pin actions...).
Item {
    id: dialogRoot
    property var viewer
    clip: true
    visible: viewer.dialogImage !== null
    // Hover handoff: the panel keeps itself open while the cursor is on
    // this separate surface (LeftPanel.requestAutoHide via hostPanel).
    HoverHandler {
        id: dialogHover
        onHoveredChanged: {
            if (viewer && typeof viewer.popupHovered !== "undefined")
                viewer.popupHovered = hovered;
        }
    }
    // Natural content height (width is fixed by the viewer, so wrapping
    // here is stable and never feeds back into the layout).
    implicitHeight: contentCol.implicitHeight
    onImplicitHeightChanged: {
        if (viewer && implicitHeight > 0)
            viewer.adoptDialogHeight(implicitHeight);
    }

    Item {
        id: slider
        anchors.fill: parent
        // Glide in from the right edge + fade; layout-agnostic.
        x: (1 - (viewer ? viewer.detailSlide : 1)) * -24
        opacity: viewer ? viewer.detailSlide : 1

        // Card surface: floats over grid content, so it carries its own
        // backdrop with a subtle outline.
        Rectangle {
            anchors.fill: parent
            color: Theme.bg
            radius: 10
            border.color: Theme.accentBg
            border.width: 1
        }

    Flickable {
        id: contentScroll
        anchors.fill: parent
        anchors.margins: 8
        contentWidth: width
        contentHeight: contentCol.implicitHeight
        clip: true
        boundsBehavior: Flickable.StopAtBounds

    Column {
        id: contentCol
        width: parent.width
        spacing: 8
        visible: viewer.dialogImage !== null

        // header: title left, close right (plain Row has no layout
        // attached props, so the spacer takes an explicit width)
        Row {
            id: dialogHeader
            width: parent.width
            spacing: 6
            Text {
                id: dialogTitle
                text: viewer.dialogImage ? `#${viewer.dialogImage.id}` : ""
                color: Theme.fg
                font.pixelSize: 12
                font.bold: true
            }
            Item {
                width: Math.max(1, dialogHeader.width - dialogTitle.width - closeBtn.width - dialogHeader.spacing * 2)
                height: 1
            }
            AppButton {
                id: closeBtn
                text: "X"
                onClicked: viewer.requestClose()
            }
        }

        // media (image / video-placeholder / zip-placeholder)
        Rectangle {
            id: dialogMedia
            width: parent.width
            height: 260
            radius: 6
            color: Theme.bg
            clip: true

            AppImage {
                anchors.fill: parent

                source: viewer.dialogImage ? viewer.dialogSource(viewer.dialogImage) : ""

                sourceWidth: parent.width
                visible: viewer.dialogImage ? !viewer.isVideo(viewer.dialogImage) : false
            }
            // video downloaded → playable via QtMultimedia (AGS Video.tsx)
            MediaVideo {
                anchors.fill: parent
                anchors.margins: 4
                source: viewer.dialogImage ? viewer.imageFileUrl(viewer.dialogImage).replace(/^file:\/\//, "") : ""
                autoplay: true
                loop: true
                fill: true
                visible: viewer.dialogImage ? viewer.isVideo(viewer.dialogImage) && viewer.isDownloaded(viewer.dialogImage) && (viewer.dialogImage.extension || "").toLowerCase() !== "zip" : false
            }
            // video not downloaded → placeholder
            Rectangle {
                anchors.fill: parent
                visible: viewer.dialogImage ? viewer.isVideo(viewer.dialogImage) && !viewer.isDownloaded(viewer.dialogImage) : false
                color: "black"
                Column {
                    anchors.centerIn: parent
                    spacing: 6
                    Text {
                        anchors.horizontalCenter: parent.horizontalCenter
                        text: "\u{f03d}"
                        font.pixelSize: 40
                        color: Theme.fgDim
                    }
                    Text {
                        anchors.horizontalCenter: parent.horizontalCenter
                        text: viewer.dialogImage && (viewer.dialogImage.extension || "").toLowerCase() === "zip" ? "Cannot be played." : "Video — download to play"
                        color: Theme.fgDim
                        font.pixelSize: 11
                    }
                }
            }
            // download progress overlay (fetch + original download)
            BusyIndicator {
                anchors.centerIn: parent
                running: viewer.progressStatus === "loading" || (viewer.dialogImage && !viewer.isVideo(viewer.dialogImage) && viewer.dialogSource(viewer.dialogImage) === "")
                visible: running
            }
            // zoom-to-full on click
            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: viewer.openInBrowser(viewer.dialogImage)
            }
        }

        // caption: dimensions + downloaded flag
        Row {
            width: parent.width
            spacing: 6
            Text {
                text: viewer.dialogImage ? `${viewer.dialogImage.width}x${viewer.dialogImage.height}` : ""
                color: Theme.fgDim
                font.pixelSize: 11
            }
            Text {
                text: viewer.dialogImage && viewer.isDownloaded(viewer.dialogImage) ? "  \u{f019} Downloaded" : ""
                color: "lightgreen"
                font.pixelSize: 11
            }
        }

        // tags flow (AGS maxTags=10; height follows content, capped)
        Flow {
            id: tagFlow
            width: parent.width
            height: Math.max(24, Math.min(120, tagFlow.implicitHeight || 68))
            spacing: 4
            clip: true
            Repeater {
                model: viewer.dialogImage && viewer.dialogImage.tags ? viewer.dialogImage.tags.slice(0, 10) : []
                delegate: Rectangle {
                    width: tagDetail.implicitWidth + 12
                    height: 20
                    radius: 10
                    color: tagDetailMa.containsMouse ? Theme.accentBg : Theme.moduleBg
                    Text {
                        id: tagDetail
                        anchors.centerIn: parent
                        text: modelData
                        color: Theme.fgDim
                        font.pixelSize: 10
                        elide: Text.ElideRight
                    }
                    MouseArea {
                        id: tagDetailMa
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: viewer.copyTag(modelData)
                        onPressAndHold: viewer.openTags(modelData)
                    }
                }
            }
        }

        // actions, stacked for narrow panel
        Column {
            id: dialogBottom
            width: parent.width
            spacing: 4
            AppButton {
                width: parent.width
                text: (viewer.isBookmarked(viewer.dialogImage) ? "󰀮 Unbookmark" : "󰀮 Bookmark")
                onClicked: viewer.toggleBookmark(viewer.dialogImage)
            }
            AppButton {
                width: parent.width
                text: (viewer.isPinned(viewer.dialogImage) ? "󰥬 Unpin" : "󰥬 Pin")
                onClicked: viewer.togglePinned(viewer.dialogImage)
            }
            AppButton {
                width: parent.width
                text: "\u{f019} Download"
                enabled: !viewer.isDownloaded(viewer.dialogImage)
                onClicked: viewer.downloadImage(viewer.dialogImage)
            }
            AppButton {
                width: parent.width
                text: (viewer.isCurrentWaifu(viewer.dialogImage) ? "\u{f004} Current waifu" : "\u{f004} Set waifu")
                onClicked: viewer.setAsWaifu(viewer.dialogImage)
            }
            AppButton {
                width: parent.width
                text: "\u{f05e} Close"
                onClicked: viewer.requestClose()
            }
        }
    }
    } // contentScroll
    } // slider

    Keys.onEscapePressed: viewer.requestClose()
    focus: visible
}
