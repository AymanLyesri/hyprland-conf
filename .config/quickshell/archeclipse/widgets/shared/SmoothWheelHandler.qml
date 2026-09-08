import QtQuick

// Shared wheel-momentum physics for all smooth scrollers.
// Attach to any Flickable-derived type (Flickable, ListView, GridView):
// feeds wheel deltas into flick() so the native deceleration,
// bounds and overshoot do the gliding.
//
//   SmoothWheelHandler { target: root }
//
// target: the Flickable to drive. wheelScale mirrors
// SmoothFlickable.wheelScale (angleDelta.y=120 -> d=60 -> 60*scale).
WheelHandler {
    id: root

    required property Flickable target
    property real wheelScale: 60

    property real velX: 0
    property real velY: 0
    property double lastT: 0

    acceptedDevices: PointerDevice.Mouse | PointerDevice.TouchPad
    onWheel: event => {
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
        velX = Math.max(-target.maximumFlickVelocity, Math.min(target.maximumFlickVelocity, velX * decay + dx * wheelScale));
        velY = Math.max(-target.maximumFlickVelocity, Math.min(target.maximumFlickVelocity, velY * decay + dy * wheelScale));
        if (dx === 0 && dy === 0) {
            // Trailing scroll-end event: flicking here dies with the
            // gesture, so re-flick once dispatch finishes and coast.
            const vx = velX;
            const vy = velY;
            Qt.callLater(() => {
                return target.flick(vx, vy);
            });
        } else {
            target.flick(velX, velY);
        }
        event.accepted = true;
    }
}
