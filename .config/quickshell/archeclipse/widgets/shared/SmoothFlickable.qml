import QtQuick

// Shared Flickable with wheel momentum via the native flick engine.
// Flickable only builds momentum from drag-release flicks (no
// wheel-momentum property exists), so wheel deltas are fed into flick()
// and its own deceleration, bounds and overshoot do the gliding.
//
// Usage: drop-in replacement for Flickable. All Flickable properties
// (contentWidth/Height, anchors, Layout.*, flickableDirection,
// ScrollBar.vertical, onContentHeightChanged, ...) pass through.
Flickable {
    id: root

    // Momentum tuning: callers can override (e.g. BooruGrid pins
    // maximumFlickVelocity lower for a slower feel).
    clip: true
    flickDeceleration: 1500
    maximumFlickVelocity: 2500

    // Per-notch gain: angleDelta.y=120 -> d=60 -> 60*scale velocity.
    property real wheelScale: 60

    WheelHandler {
        property real velX: 0
        property real velY: 0
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
            const decay = Math.exp(-dt / 180);
            // NOTE: flick() takes finger velocity, not content velocity:
            // positive moves content down/right (contentY/X decreases, i.e.
            // scroll up/left), matching positive wheel deltas (wheel up).
            // A minus sign here inverts the scroll direction.
            const dx = event.pixelDelta.x !== 0 ? event.pixelDelta.x : event.angleDelta.x / 2;
            const dy = event.pixelDelta.y !== 0 ? event.pixelDelta.y : event.angleDelta.y / 2;
            velX = Math.max(-root.maximumFlickVelocity, Math.min(root.maximumFlickVelocity, velX * decay + dx * root.wheelScale));
            velY = Math.max(-root.maximumFlickVelocity, Math.min(root.maximumFlickVelocity, velY * decay + dy * root.wheelScale));
            if (dx === 0 && dy === 0) {
                // Trailing scroll-end event: flicking here dies with the
                // gesture, so re-flick once dispatch finishes and coast.
                const vx = velX;
                const vy = velY;
                Qt.callLater(() => {
                    return root.flick(vx, vy);
                });
            } else {
                root.flick(velX, velY);
            }
            event.accepted = true;
        }
    }
}
