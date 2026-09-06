import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

// Masonry image grid (extracted verbatim from BooruViewerWidget).
// viewer: entry root (masonryColumns, columns).
Flickable {
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

    // Frozen while the detail revealer is open (viewer._gridWidth captured
    // on open): grid keeps its exact width, revealer absorbs all growth.
    Layout.fillWidth: viewer ? viewer.dialogImage === null : true
    Layout.preferredWidth: viewer && viewer.dialogImage !== null ? viewer._gridWidth : 0
    Layout.fillHeight: true
    clip: true
    contentWidth: width
    contentHeight: masonryRow.height
    // Touch-fling glide (wheel inertia is handled below).
    flickDeceleration: 1500
    maximumFlickVelocity: 1000

    // Wheel momentum via the native flick engine: Flickable only builds
    // momentum from drag-release flicks (no wheel-momentum property
    // exists), so feed wheel deltas into flick() and let its own
    // deceleration, bounds and overshoot do the gliding.
    WheelHandler {
        property real vel: 0
        property double lastT: 0

        acceptedDevices: PointerDevice.Mouse | PointerDevice.TouchPad
        onWheel: (event) => {
            // Time-based decay: smooth-scroll devices send tiny deltas at
            // high frequency, which an event-count decay crushes to a crawl.
            // Velocity accumulates across rapid events and dies within ~120ms
            // once input stops, so stale speed never leaks into the next gesture.
            const now = Date.now();
            const dt = lastT > 0 ? now - lastT : 16;
            lastT = now;
            const d = event.pixelDelta.y !== 0 ? event.pixelDelta.y : event.angleDelta.y / 2;
            vel = Math.max(-gridScroll.maximumFlickVelocity, Math.min(gridScroll.maximumFlickVelocity, vel * Math.exp(-dt / 180) - d * 60));
            if (d === 0) {
                // Trailing scroll-end event: flicking here dies with the
                // gesture, so re-flick once dispatch finishes and coast.
                const v = vel;
                Qt.callLater(() => {
                    return gridScroll.flick(0, v);
                });
            } else {
                gridScroll.flick(0, vel);
            }
            event.accepted = true;
        }
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
