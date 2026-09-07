import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.widgets.shared

// Masonry image grid (extracted verbatim from BooruViewerWidget).
// viewer: entry root (masonryColumns, columns).
SmoothFlickable {
    id: gridScroll

    property var viewer

    // Called by the entry on page change (was direct id access).
    function resetScroll() {
        gridScroll.contentY = 0;
    }

    function slideFrom(x) {
        slideAnim.stop();
        masonryRow.x = x;
        slideAnim.start();
    }

    // Always full width: the detail is a root-level overlay, so the grid
    // never surrenders space or relayouts when it opens.
    Layout.fillWidth: true
    Layout.fillHeight: true
    clip: true
    contentWidth: width
    contentHeight: masonryRow.height
    // Booru pins the fling speed lower than the shared default.
    maximumFlickVelocity: 1000

    // Follow tick: the card glides inside the static popup surface, so
    // scrolling here only retargets a local y binding (plus the cheap
    // dismiss check) — no window reposition, no layout, no stutter.
    onContentYChanged: {
        if (viewer && viewer.dialogImage !== null)
            viewer.refreshDialogTop(-1);
    }
    onHeightChanged: {
        if (viewer && viewer.dialogImage !== null)
            viewer.refreshDialogTop(-1);
    }

    // Masonry row: N shortest-column Columns (AGS algorithm above)
    Row {
        id: masonryRow

        width: parent.width
        spacing: 6

        // Slide transition on page change (AGS Gtk.Stack
        // SLIDE_LEFT/RIGHT + scroll-to-top after transition)
        NumberAnimation {
            id: slideAnim

            target: masonryRow
            property: "x"
            duration: 200
            to: 0
        }

        Repeater {
            model: viewer.masonryColumns

            delegate: Column {
                required property var modelData
                property var columnItems: modelData

                width: (masonryRow.width - (viewer.columns - 1) * 6) / viewer.columns
                spacing: 6

                Repeater {
                    model: parent.columnItems

                    // NOTE: a cross-file delegate cannot see the inner
                    // modelData (resolves to the outer column array /
                    // undefined). Capture it in a same-file wrapper first —
                    // `property var img: modelData` here is proven correct —
                    // then hand it to the card via parent.
                    delegate: Column {
                        property var img: modelData

                        width: parent.width

                        BooruImage {
                            viewer: gridScroll.viewer
                            image: parent.img
                        }

                    }

                }

            }

        }

    }

    ScrollBar.vertical: ScrollBar {
    }

}
