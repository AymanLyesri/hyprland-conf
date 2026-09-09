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
//
// Design refs:
// - NotificationItem: surface card + radius, top RowLayout (icon, bold
//   title fillWidth, dim meta, 24px outlined icon buttons).
// - MangaViewer cards: inner Column margins 10, spacing 6, Theme fonts.
// - WaifuWidget: RowLayout action sections (fillWidth, 28px, tooltips,
//   toggle/checked), pill containers on Theme.bg.
Item {
    id: dialogRoot
    property var viewer
    // "Tags" expand state (NotificationItem expand/collapse parity).
    // Reset per-image: dlg tracks viewer.dialogImage, so its change
    // signal fires exactly when a new post is opened.
    property bool showAllTags: false
    onDlgChanged: showAllTags = false
    clip: true
    visible: viewer && viewer.dialogImage !== null
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
    implicitHeight: contentCol.implicitHeight + 20
    onImplicitHeightChanged: {
        if (viewer && implicitHeight > 0)
            viewer.adoptDialogHeight(implicitHeight);
    }

    // Derived display helpers (null-safe; dialogImage may be null).
    readonly property var dlg: viewer ? viewer.dialogImage : null
    readonly property string dlgApiName: dlg && dlg.api ? (dlg.api.name || "") : ""
    readonly property string dlgExt: dlg ? ((dlg.extension || "").toUpperCase()) : ""
    readonly property string dlgDims: dlg ? `${dlg.width || 0}×${dlg.height || 0}` : ""
    readonly property var dlgTags: dlg && dlg.tags ? dlg.tags : []
    readonly property bool dlgIsVideo: dlg ? (viewer ? viewer.isVideo(dlg) : false) : false
    readonly property bool dlgIsZip: dlg ? ((dlg.extension || "").toLowerCase() === "zip") : false
    readonly property bool dlgDownloaded: dlg ? (viewer ? viewer.isDownloaded(dlg) : false) : false
    readonly property bool dlgBookmarked: dlg ? (viewer ? viewer.isBookmarked(dlg) : false) : false
    readonly property bool dlgPinned: dlg ? (viewer ? viewer.isPinned(dlg) : false) : false
    readonly property bool dlgIsWaifu: dlg ? (viewer ? viewer.isCurrentWaifu(dlg) : false) : false
    readonly property bool dlgLoading: viewer ? (viewer.progressStatus === "loading" || (dlg && !dlgIsVideo && viewer.dialogSource(dlg) === "")) : false
    readonly property bool dlgVideoPlayable: dlg ? (dlgIsVideo && dlgDownloaded && !dlgIsZip) : false
    readonly property bool dlgVideoPlaceholder: dlg ? (dlgIsVideo && !dlgDownloaded) : false
    // Aspect-aware media height (MangaViewer parity): follow the image
    // ratio, clamped so panoramas/portraits stay sane in a 232px card.
    readonly property real dlgMediaH: {
        if (!dlg || !dlg.width || !dlg.height)
            return 200;
        const w = Math.max(1, contentCol.width || 200);
        const h = w * dlg.height / dlg.width;
        return Math.min(Math.max(h, 140), 340);
    }
    readonly property string dlgTypeIcon: dlgIsZip ? "" : (dlgIsVideo ? "" : "")
    readonly property int dlgVisibleTagCount: showAllTags ? dlgTags.length : Math.min(dlgTags.length, 12)

    Item {
        id: slider
        anchors.fill: parent
        // Glide in from the right edge + fade; layout-agnostic.
        x: (1 - (viewer ? viewer.detailSlide : 1)) * -24
        opacity: viewer ? viewer.detailSlide : 1

        // Card surface: floats over grid content, so it carries its own
        // backdrop with a subtle outline (NotificationItem parity:
        // Theme.surface + Theme.radius + Theme.border).
        Rectangle {
            anchors.fill: parent
            color: Theme.surface
            radius: Theme.radius
            border.color: Theme.border
            border.width: 1
        }

        SmoothFlickable {
            id: contentScroll
            anchors.fill: parent
            anchors.margins: 10
            contentWidth: width
            contentHeight: contentCol.implicitHeight
            clip: true
            boundsBehavior: Flickable.StopAtBounds

            Column {
                id: contentCol
                width: parent.width
                spacing: 8
                visible: viewer && viewer.dialogImage !== null

                // Header: type badge + title block + icon actions
                // (NotificationItem top-bar parity).
                RowLayout {
                    id: dialogHeader
                    width: parent.width
                    spacing: 6

                    Rectangle {
                        width: 26
                        height: 26
                        radius: 6
                        color: Theme.surfaceActive
                        Text {
                            anchors.centerIn: parent
                            text: dialogRoot.dlgTypeIcon
                            font.pixelSize: 12
                            font.family: Theme.fontFamily
                            color: Theme.accent
                        }
                    }

                    Column {
                        Layout.fillWidth: true
                        spacing: 0
                        Text {
                            text: dlg ? `#${dlg.id}` : ""
                            color: Theme.fg
                            font.pixelSize: Theme.fontSize
                            font.bold: true
                            font.family: Theme.fontFamily
                            elide: Text.ElideRight
                            width: parent.width
                        }
                        Text {
                            text: dlg ? `${dialogRoot.dlgApiName} • ${dialogRoot.dlgDims}` : ""
                            color: Theme.fgDim
                            font.pixelSize: Theme.fontSize - 2
                            font.family: Theme.fontFamily
                            elide: Text.ElideRight
                            width: parent.width
                        }
                    }

                    AppButton {
                        icon: ""
                        width: 26
                        height: 26
                        pixelSize: 11
                        cornerRadius: 6
                        outlined: true
                        tooltipText: "Open in browser"
                        onClicked: {
                            if (viewer && dlg)
                                viewer.openInBrowser(dlg);
                        }
                    }
                    AppButton {
                        icon: ""
                        width: 26
                        height: 26
                        pixelSize: 11
                        cornerRadius: 6
                        outlined: true
                        hoverFg: Theme.danger
                        tooltipText: "Close (Esc)"
                        onClicked: {
                            if (viewer)
                                viewer.requestClose();
                        }
                    }
                }

                // Media (image / video / zip-placeholder) with unified
                // AppImage top-right badges and a loading spinner.
                Rectangle {
                    id: dialogMedia
                    width: parent.width
                    height: dialogRoot.dlgMediaH
                    radius: 8
                    color: Theme.bg
                    border.color: Theme.border
                    border.width: 1
                    clip: true

                    // video downloaded → playable via QtMultimedia (AGS Video.tsx)
                    MediaVideo {
                        anchors.fill: parent
                        anchors.margins: 4
                        source: dlg ? viewer.imageFileUrl(dlg).replace(/^file:\/\//, "") : ""
                        autoplay: true
                        loop: true
                        fill: true
                        visible: dialogRoot.dlgVideoPlayable
                    }
                    // video not downloaded → placeholder
                    Column {
                        anchors.centerIn: parent
                        spacing: 6
                        visible: dialogRoot.dlgVideoPlaceholder || dialogRoot.dlgIsZip
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: dialogRoot.dlgIsZip ? "" : ""
                            font.pixelSize: 32
                            font.family: Theme.fontFamily
                            color: Theme.fgDim
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: dialogRoot.dlgIsZip ? "Cannot be played." : "Video — download to play"
                            color: Theme.fgDim
                            font.pixelSize: Theme.fontSize - 1
                            font.family: Theme.fontFamily
                        }
                    }
                    AppImage {
                        anchors.fill: parent
                        anchors.margins: 2
                        source: dlg ? viewer.dialogSource(dlg) : ""
                        sourceWidth: parent.width
                        visible: !!dlg
                        badges: {
                            const b = [];
                            if (dialogRoot.dlgDownloaded)
                                b.push("\uf019");
                            if (dialogRoot.dlgBookmarked)
                                b.push("\uf02e");
                            if (dialogRoot.dlgPinned)
                                b.push("\uf08d");
                            if (dialogRoot.dlgIsWaifu)
                                b.push("\uf004");
                            return b;
                        }
                    }
                    AppProgress {
                        anchors.centerIn: parent
                        width: 20
                        height: 20
                        status: dialogRoot.dlgLoading ? "loading" : "idle"
                        variant: "spinner"
                    }
                    // zoom-to-full on click
                    MouseArea {
                        anchors.fill: parent
                        cursorShape: Qt.PointingHandCursor
                        hoverEnabled: true
                        AppTooltip {
                            visible: parent.containsMouse
                            text: "Open post in browser"
                        }
                        onClicked: {
                            if (viewer && dlg)
                                viewer.openInBrowser(dlg);
                        }
                    }
                }

                // Meta strip: dims • ext • status (WallpaperPanel pill parity).
                Rectangle {
                    width: parent.width
                    implicitHeight: metaRow.implicitHeight + 12
                    radius: 6
                    color: Theme.bg
                    RowLayout {
                        id: metaRow
                        anchors.fill: parent
                        anchors.margins: 6
                        spacing: 6
                        Text {
                            text: dialogRoot.dlgDims
                            color: Theme.fg
                            font.pixelSize: Theme.fontSize - 2
                            font.family: Theme.fontFamily
                        }
                        Text {
                            text: "•"
                            color: Theme.fgDim
                            font.pixelSize: Theme.fontSize - 2
                        }
                        Text {
                            text: dialogRoot.dlgExt
                            color: Theme.accent
                            font.pixelSize: Theme.fontSize - 2
                            font.bold: true
                            font.family: Theme.fontFamily
                        }
                        Item {
                            Layout.fillWidth: true
                            height: 1
                        }
                        Text {
                            text: dialogRoot.dlgDownloaded ? "● Saved" : "○ Preview"
                            color: dialogRoot.dlgDownloaded ? "lightgreen" : Theme.fgDim
                            font.pixelSize: Theme.fontSize - 2
                            font.family: Theme.fontFamily
                        }
                    }
                }

                // Tags section (BooruSettingsPanel chip parity + expand).
                Column {
                    width: parent.width
                    spacing: 4
                    RowLayout {
                        width: parent.width
                        spacing: 6
                        Text {
                            text: `TAGS (${dialogRoot.dlgTags.length})`
                            color: Theme.fgDim
                            font.pixelSize: Theme.fontSize - 2
                            font.bold: true
                            font.family: Theme.fontFamily
                            Layout.fillWidth: true
                            elide: Text.ElideRight
                        }
                        AppButton {
                            icon: dialogRoot.showAllTags ? "" : ""
                            width: 24
                            height: 22
                            pixelSize: 10
                            cornerRadius: 4
                            outlined: true
                            tooltipText: dialogRoot.showAllTags ? "Show fewer" : "Show all tags"
                            visible: dialogRoot.dlgTags.length > 12
                            onClicked: dialogRoot.showAllTags = !dialogRoot.showAllTags
                        }
                    }
                    Rectangle {
                        width: parent.width
                        implicitHeight: tagFlow.implicitHeight + 12
                        radius: 6
                        color: Theme.bg
                        Flow {
                            id: tagFlow
                            anchors.fill: parent
                            anchors.margins: 6
                            spacing: 4
                            Repeater {
                                model: dlg ? dialogRoot.dlgTags.slice(0, dialogRoot.dlgVisibleTagCount) : []
                                delegate: Rectangle {
                                    width: tagDetail.implicitWidth + 14
                                    height: 22
                                    radius: 11
                                    color: tagDetailMa.containsMouse ? Theme.surfaceActive : Theme.surface
                                    border.color: Theme.border
                                    border.width: 1
                                    Text {
                                        id: tagDetail
                                        anchors.centerIn: parent
                                        text: modelData
                                        color: Theme.fgDim
                                        font.pixelSize: Theme.fontSize - 2
                                        font.family: Theme.fontFamily
                                        elide: Text.ElideRight
                                    }
                                    AppTooltip {
                                        visible: tagDetailMa.containsMouse
                                        text: "Click: copy • Hold: add to search"
                                    }
                                    MouseArea {
                                        id: tagDetailMa
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: {
                                            if (viewer)
                                                viewer.copyTag(modelData);
                                        }
                                        onPressAndHold: {
                                            if (viewer)
                                                viewer.openTags(modelData);
                                        }
                                    }
                                }
                            }
                        }
                        Text {
                            anchors.centerIn: parent
                            text: "No tags"
                            color: Theme.fgDim
                            font.pixelSize: Theme.fontSize - 2
                            font.family: Theme.fontFamily
                            font.italic: true
                            visible: dialogRoot.dlgTags.length === 0
                        }
                    }
                    Text {
                        width: parent.width
                        text: `+${dialogRoot.dlgTags.length - dialogRoot.dlgVisibleTagCount} more — click the expand icon`
                        color: Theme.fgDim
                        font.pixelSize: Theme.fontSize - 3
                        font.family: Theme.fontFamily
                        elide: Text.ElideRight
                        visible: !dialogRoot.showAllTags && dialogRoot.dlgTags.length > dialogRoot.dlgVisibleTagCount
                    }
                }

                // Actions (WaifuWidget section parity: 2-col grids of
                // fillWidth buttons + one subtle full-width dismiss).
                Column {
                    id: dialogBottom
                    width: parent.width
                    spacing: 6
                    RowLayout {
                        width: parent.width
                        spacing: 6
                        AppButton {
                            Layout.fillWidth: true
                            height: 30
                            icon: dialogRoot.dlgBookmarked ? "" : ""
                            text: dialogRoot.dlgBookmarked ? "Saved" : "Save"
                            toggle: true
                            checked: dialogRoot.dlgBookmarked
                            outlined: true
                            pixelSize: Theme.fontSize - 2
                            tooltipText: dialogRoot.dlgBookmarked ? "Remove bookmark" : "Bookmark this post"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.toggleBookmark(dlg);
                            }
                        }
                        AppButton {
                            Layout.fillWidth: true
                            height: 30
                            icon: dialogRoot.dlgPinned ? "" : ""
                            text: dialogRoot.dlgPinned ? "Pinned" : "Pin"
                            toggle: true
                            checked: dialogRoot.dlgPinned
                            outlined: true
                            pixelSize: Theme.fontSize - 2
                            // AGS pin-button parity: sensitive only once the
                            // full file is downloaded (the fastfetch sync
                            // converts it) and never for video/zip.
                            enabled: dialogRoot.dlgDownloaded && !dialogRoot.dlgIsVideo && !dialogRoot.dlgIsZip
                            tooltipText: dialogRoot.dlgIsVideo || dialogRoot.dlgIsZip ? "Cannot pin videos" : !dialogRoot.dlgDownloaded ? "Download first to pin" : dialogRoot.dlgPinned ? "Unpin from terminal" : "Pin to terminal"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.togglePinned(dlg);
                            }
                        }
                    }
                    RowLayout {
                        width: parent.width
                        spacing: 6
                        AppButton {
                            Layout.fillWidth: true
                            height: 30
                            icon: dialogRoot.dlgDownloaded ? "" : ""
                            text: dialogRoot.dlgDownloaded ? "Saved" : "Download"
                            enabled: !!(dlg && viewer && !viewer.isDownloaded(dlg))
                            idleBg: dialogRoot.dlgDownloaded ? "transparent" : Theme.surfaceActive
                            idleFg: dialogRoot.dlgDownloaded ? Theme.fgDim : Theme.accent
                            outlined: true
                            outlineColor: Theme.accent
                            pixelSize: Theme.fontSize - 2
                            tooltipText: "Download full original"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.downloadImage(dlg);
                            }
                        }
                        AppButton {
                            Layout.fillWidth: true
                            height: 30
                            icon: ""
                            text: dialogRoot.dlgIsWaifu ? "Waifu ✓" : "Waifu"
                            toggle: true
                            checked: dialogRoot.dlgIsWaifu
                            outlined: true
                            pixelSize: Theme.fontSize - 2
                            tooltipText: dialogRoot.dlgIsWaifu ? "Current waifu" : "Set as waifu"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.setAsWaifu(dlg);
                            }
                        }
                    }
                    RowLayout {
                        width: parent.width
                        spacing: 6
                        AppButton {
                            Layout.fillWidth: true
                            height: 28
                            icon: ""
                            text: "Open"
                            outlined: true
                            pixelSize: Theme.fontSize - 2
                            tooltipText: "Open post in browser"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.openInBrowser(dlg);
                            }
                        }
                        AppButton {
                            Layout.fillWidth: true
                            height: 28
                            icon: ""
                            text: "Copy ID"
                            outlined: true
                            pixelSize: Theme.fontSize - 2
                            tooltipText: "Copy post ID"
                            onClicked: {
                                if (viewer && dlg)
                                    viewer.copyTag(String(dlg.id));
                            }
                        }
                    }
                    AppButton {
                        width: parent.width
                        height: 28
                        icon: ""
                        text: "Close"
                        pixelSize: Theme.fontSize - 2
                        idleFg: Theme.fgDim
                        tooltipText: "Close (Esc)"
                        onClicked: {
                            if (viewer)
                                viewer.requestClose();
                        }
                    }
                }
            }
        } // contentScroll
    } // slider

    Keys.onEscapePressed: {
        if (viewer)
            viewer.requestClose();
    }
    focus: visible
}
