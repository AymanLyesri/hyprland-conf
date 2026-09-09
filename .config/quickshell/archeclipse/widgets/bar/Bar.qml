import QtQuick
import Quickshell
import Quickshell.Hyprland
import Quickshell.Wayland
import Quickshell.Io
import qs.theme
import qs.services
import qs.widgets.bar
import qs.widgets.bar.islands
import qs.widgets.launcher

// Port of widgets/bar/Bar.tsx — the floating ArchEclipse bar pill.
PanelWindow {
    id: root

    required property ShellScreen screen
    readonly property string monitorName: {
        const hmon = Hyprland.monitorFor(screen);
        if (hmon && hmon.name)
            return hmon.name;
        // fallback: try to get monitor name from screen
        return screen?.name ?? "unknown";
    }

    // --- window geometry / layer ---
    anchors {
        left: true
        right: true
        top: Settings.barOrientation
        bottom: !Settings.barOrientation
    }

    // layer-shell keyboard grab while the search island is open
    // (the control island stays OnDemand so typing elsewhere keeps working)
    WlrLayershell.keyboardFocus: BarState.state === "search" ? WlrKeyboardFocus.Exclusive : WlrKeyboardFocus.OnDemand
    exclusiveZone: Settings.barLock ? barHeight : -1
    color: "transparent"
    aboveWindows: true

    readonly property int barHeight: 32
    // Snap the layer surface to content (no Behavior here — animating the
    // PanelWindow renegotiates with the compositor every frame and stutters).
    // Inner content (pill width spring + island expand spring) carries motion.
    implicitHeight: pill.height

    // visibility: fullscreen focused client hides; search pins; override wins;
    // otherwise lock/smart-hide geometric room-check (matches AGS Bar.tsx).
    // AGS: fullscreenClient = focusedClient with fullscreen === 2.
    readonly property bool fullscreenActive: {
        const mon = Hyprland.monitorFor(screen);
        const ws = mon?.activeWorkspace;
        if (!ws)
            return false;
        const wsId = ws.id ?? ws;
        const tops = Hyprland.toplevels.values.filter(t => (t.workspace?.id ?? t.workspace) === wsId);
        // Any fullscreen client on this monitor's active workspace occupies
        // the bar band (hyprctl clients fullscreen: 2 = fullscreen, 3 = maximized?)
        return tops.some(t => {
            const fs = t.lastIpcObject?.fullscreen;
            return fs === 2 || fs === 3;
        });
    }
    // Re-evaluate when Hyprland geometry events arrive (clients move/resize).
    readonly property bool roomCheckLive: BarState.hyprlandTick >= 0

    readonly property bool barVisible: {
        if (fullscreenActive)
            return false;
        if (BarState.state === "search" || BarState.state === "control" || BarState.state === "wallpaper")
            return true;
        const override = (BarState.barShown || {})[monitorName];
        if (override !== undefined)
            return override;
        BarState.hyprlandTick; // reap the reactive dependency
        return BarState.barVisibleFor(monitorName);
    }

    // --- hover: expand on enter, collapse after leave delay (AGS: motion
    // controller on the bar pill; leave arms a 250ms timer that collapses
    // only if the pointer is still off AND no popup is open) ---
    property bool hovered: pillHover.hovered
    Component.onCompleted: {
        if (Settings.barDefault)
            BarState.activate("default");
    }
    onHoveredChanged: {
        if (hovered) {
            BarState.activate("default");
            hideTimer.stop();
        } else {
            hideTimer.restart();
        }
    }
    Timer {
        id: hideTimer
        interval: 250
        onTriggered: {
            // AGS leave handler: collapse default (guarded by hover+popup),
            // then conceal the bar when unlocked and search isn't pinning it.
            if (!root.hovered && BarState.popupCount <= 0 && !Settings.barDefault)
                BarState.deactivate("default");
            if (BarState.state !== "search" && BarState.state !== "control" && BarState.state !== "wallpaper" && !Settings.barLock && !root.hovered && BarState.popupCount <= 0)
                BarState.concealBar(root.monitorName);
        }
    }

    // idle watchdog for hover-reveal overrides
    Connections {
        target: BarState
        function onBarShownChanged() {
            if (BarState.barShown[root.monitorName] === true)
                idleTimer.restart();
            else
                idleTimer.stop();
        }
    }
    Timer {
        id: idleTimer
        interval: 1500
        running: (BarState.barShown || {})[root.monitorName] === true
        onTriggered: {
            if (Settings.barLock)
                return;
            if (BarState.state === "search" || BarState.state === "control" || BarState.state === "wallpaper") {
                idleTimer.restart();
                return;
            }
            // AGS watchdog parity: don't trust the hover read alone (reveals
            // can fire without an enter/leave cycle). Ask Hyprland where the
            // cursor actually is; if it is over the bar band or a popup is
            // open, keep waiting. If position is unknown, DON'T conceal
            // blindly — restart the check.
            if (BarState.popupCount > 0) {
                idleTimer.restart();
                return;
            }
            root.verifyCursorOffBar();
        }
    }

    // AGS pointerOnBar(): cursorpos vs monitor band geometry.
    property var _cursorProc: null
    function verifyCursorOffBar() {
        if (root._cursorProc)
            return;
        var p = Qt.createQmlObject('import Quickshell.Io; Process { command: ["hyprctl", "cursorpos"] }', root);
        root._cursorProc = p;
        var out = Qt.createQmlObject('import Quickshell.Io; StdioCollector {}', root);
        p.stdout = out;
        out.onStreamFinished.connect(() => {
            var proc = root._cursorProc;
            root._cursorProc = null;
            var stillOff = root.cursorOffBar(out.text);
            if (stillOff === true) {
                if (!root.hovered && BarState.popupCount <= 0)
                    BarState.concealBar(root.monitorName);
            } else if (stillOff === false) {
                idleTimer.restart();
            } else {
                // unknown — don't conceal blindly (AGS catch branch)
                idleTimer.restart();
            }
            out.destroy();
            proc.destroy();
        });
        p.running = true;
    }
    // Returns true = cursor verifiably off bar, false = on bar,
    // undefined = can't tell.
    function cursorOffBar(cursorText) {
        try {
            var parts = (cursorText || "").trim().split(",");
            if (parts.length < 2)
                return undefined;
            var x = parseInt(parts[0], 10);
            var y = parseInt(parts[1], 10);
            if (isNaN(x) || isNaN(y))
                return undefined;
            var mon = Hyprland.monitorFor(screen);
            if (!mon)
                return undefined;
            var h = root.barHeight;
            if (x < mon.x || x > mon.x + mon.width)
                return true;
            var onBar = Settings.barOrientation ? y <= mon.y + h : y >= mon.y + mon.height - h;
            return !onBar;
        } catch (e) {
            return undefined;
        }
    }

    Item {
        id: stripRoot
        anchors.fill: parent

        // ---- the pill ----
        Rectangle {
            id: pill
            anchors.horizontalCenter: parent.horizontalCenter
            y: Settings.barOrientation ? 0 : parent.height - height
            // Grows with content: 32 for normal states, tall when the
            // search island (input + launcher) is shown.
            height: Math.max(root.barHeight, stack.height + 10)
            // Bound to targetWidth + frame-synced Behavior: the scene-graph
            // render thread drives the spring on vsync instead of a 16ms
            // QML Timer ticking JS physics on the GUI thread (jitter from
            // timer drift + fixed-dt integration + a full re-polish/
            // re-anchor of the centered stack on every write = choppy).
            // NOTE: QML SpringAnimation units are NOT the AGS constants
            // (QML damping range is 0..1); values match the repo's proven
            // island springs (Control/SearchIsland 3.5/0.32), stiffened and
            // damped a touch for the wide pill. Same feel: quick settle,
            // slight overshoot.
            width: targetWidth
            property bool widthAnimReady: false
            Component.onCompleted: widthAnimReady = true
            Behavior on width {
                enabled: pill.widthAnimReady
                SpringAnimation { spring: 5; damping: 0.5; mass: 1.0; epsilon: 0.5 }
            }
            bottomRightRadius: Theme.radius
            bottomLeftRadius: Theme.radius
            color: Theme.surface

            // Hover detection lives on the pill itself (stable container).
            // AGS parity: the motion controller is on the bar pill — hot-zone
            // strips at the bar ends must NOT trigger expand.
            HoverHandler {
                id: pillHover
            }

            // Spring target (AGS Bar.tsx grow-first/shrink-first sequencing).
            // widthOverride pins the target during grow-first sequencing.
            property real widthOverride: -1
            property real targetWidth: widthOverride >= 0 ? widthOverride : Math.max(stack.width + 10, 100)

            // ---- state stack with crossfade ----
            // AGS parity (Bar.tsx barState.subscribe): when GROWING, animate
            // the width first and swap content 100ms later; when SHRINKING,
            // swap content first and animate after 100ms. This keeps the
            // pill from clipping big content or collapsing under small one.
            Item {
                id: stack
                anchors.centerIn: parent
                // Hold the last measured width across the 1-frame Loader
                // swap gap (item == null): without this the target dips to
                // the 100px floor mid-transition and the spring visibly
                // stutters (wide -> 100 -> island instead of wide -> island).
                // implicitWidth fallback covers Row-based pages (DefaultBar)
                // whose width stays 0 while content lays out past its bounds.
                property real lastWidth: 0
                width: {
                    var it = currentPageLoader.item;
                    if (!it)
                        return lastWidth;
                    var w = Math.max(it.width || 0, it.implicitWidth || 0);
                    return w > 0 ? w : lastWidth;
                }
                onWidthChanged: if (width > 0)
                    lastWidth = width
                height: childrenRect.height

                // The state actually shown (lags BarState.state by 100ms on grow)
                property string displayed: BarState.state
                property string pending: ""
                // Measured widths per state (AGS barWidths registry)
                property var widthCache: ({})

                Connections {
                    target: BarState
                    function onStateChanged() {
                        var s = BarState.state;
                        if (s === stack.displayed) {
                            stack.pending = "";
                            swapTimer.stop();
                            return;
                        }
                        var cached = stack.widthCache[s];
                        if (cached !== undefined && cached > pill.width) {
                            // Growing: expand first, swap content after 100ms
                            // (Behavior on pill.width carries the motion).
                            stack.pending = s;
                            pill.widthOverride = cached + 10;
                            swapTimer.restart();
                        } else {
                            // Shrinking or unknown: swap now, width follows
                            stack.pending = "";
                            swapTimer.stop();
                            pill.widthOverride = -1;
                            stack.displayed = s;
                        }
                    }
                }
                Timer {
                    id: swapTimer
                    interval: 100
                    onTriggered: {
                        if (stack.pending !== "") {
                            stack.displayed = stack.pending;
                            stack.pending = "";
                        }
                        pill.widthOverride = -1;
                    }
                }

                property string current: stack.displayed
                onCurrentChanged: fade.restart()
                readonly property string previous: ""

                SequentialAnimation {
                    id: fade
                    PropertyAction {
                        target: stack
                        property: "opacity"
                        value: 0.35
                    }
                    NumberAnimation {
                        target: stack
                        property: "opacity"
                        from: 0.35
                        to: 1
                        duration: 250
                        easing.type: Easing.InOutQuad
                    }
                }

                Loader {
                    id: currentPageLoader
                    sourceComponent: {
                        switch (stack.current) {
                        case "default":
                            return defaultPage;
                        case "volume":
                            return controlPage;
                        case "brightness":
                            return controlPage;
                        case "recording":
                            return recordingPage;
                        case "player":
                            return playerPage;
                        case "weather":
                            return weatherPage;
                        case "network":
                            return networkPage;
                        case "search":
                            return searchPage;
                        case "system":
                            return systemPage;
                        case "control":
                            return controlPage;
                        case "wallpaper":
                            return wallpaperPage;
                        default:
                            return defaultPage;
                        }
                    }
                    // Feed the per-state width registry (AGS barWidths)
                    onLoaded: {
                        if (item && item["monitorName"] !== undefined)
                            item.monitorName = root.monitorName;
                        var mw = item ? Math.max(item.width || 0, item.implicitWidth || 0) : 0;
                        if (mw > 0) {
                            var c = Object.assign({}, stack.widthCache);
                            c[stack.current] = mw;
                            stack.widthCache = c;
                        }
                    }
                }

                Component {
                    id: defaultPage
                    DefaultBar {}
                }
                Component {
                    id: recordingPage
                    RecordingIsland {}
                }
                Component {
                    id: playerPage
                    PlayerIsland {}
                }
                Component {
                    id: weatherPage
                    WeatherIsland {}
                }
                Component {
                    id: networkPage
                    NetworkWidget {}
                }
                Component {
                    id: searchPage
                    SearchIsland {}
                }
                Component {
                    id: systemPage
                    SystemMonitorIsland {}
                }
                Component {
                    id: controlPage
                    ControlIsland {}
                }
                Component {
                    id: wallpaperPage
                    WallpaperIsland {}
                }
            }
        }

        // ---- hot zones (left/right panel reveal strips) ----
        HotZone {
            side: "left"
            size: Settings.leftPanelHotZoneSize
            enabled: Settings.leftPanelHotZone
            panelLock: Settings.leftPanelLock
            monitorName: root.monitorName
        }
        HotZone {
            side: "right"
            size: Settings.rightPanelHotZoneSize
            enabled: Settings.rightPanelHotZone
            panelLock: Settings.rightPanelLock
            monitorName: root.monitorName
        }
    }

    visible: barVisible
}
