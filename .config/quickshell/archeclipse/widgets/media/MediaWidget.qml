import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell.Services.Mpris
import qs.theme
import qs.services
import qs.widgets.shared

// Media Widget — port of widgets/MediaWidget.tsx + widgets/Player.tsx.
// Shows the active (playing-else-first) player with the rich Player layout:
// cover art + spinning indicator + track slide transition, drag-scrubbable
// position, can_* gated controls. (Cava visualizer omitted: requires cava.)
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""

    // Natural size (single source of truth): consumers without a sized
    // parent (e.g. PlayerIsland) derive their size from these instead
    // of hardcoding width/height.
    implicitWidth: 400
    implicitHeight: 170

    // Pick active player: the PLAYING one, else the first (matches AGS
    // MediaWidget / AppLauncher left pane logic). Mpris.players is an
    // UntypedObjectModel — access via .values for iteration.
    readonly property var playersList: Mpris.players.values ?? (Array.from ? Array.from(Mpris.players.values() ?? []) : [])
    readonly property var player: {
        for (const p of root.playersList) {
            if (p.isPlaying)
                return p;
        }
        return root.playersList.length > 0 ? root.playersList[0] : null;
    }

    readonly property bool playing: root.player?.isPlaying ?? false

    // Hysteresis: hold last valid cover to prevent flicker (AGS lastValidCover)
    property string _lastCover: ""
    onArtUrlChanged: {
        if (artUrl && artUrl.trim() !== "")
            root._lastCover = artUrl;
    }

    property bool scrubbing: false
    property real scrubPos: 0

    // Title/artist from active player (binding → change signal fires)
    property string title: root.player?.trackTitle ?? "Unknown Track"
    property string artist: root.player?.trackArtist ?? "Unknown Artist"
    property string artUrl: root.player?.trackArtUrl ?? ""

    // Title change → slide animation via MPRIS trackTitleChanged signal
    Connections {
        target: root.player
        function onTrackTitleChanged() {
            slideAnim.stop();
            textLayer.anchors.verticalCenterOffset = -12;
            slideAnim.to = 0;
            slideAnim.restart();
        }
    }

    function fmt(usec) {
        if (!usec || usec <= 0)
            return "0:00";
        const s = Math.floor(usec / 1e6);
        const m = Math.floor(s / 60), ss = s % 60;
        return m + ":" + (ss < 10 ? "0" : "") + ss;
    }

    Rectangle {
        anchors.fill: parent
        radius: 8
        clip: true
        color: Theme.surface

        border.color: Theme.border
        visible: root.player !== null

        // Blurred background cover (AGS Picture "img" blurred layer)
        AppImage {
            anchors.fill: parent
            source: root._lastCover || ""

            opacity: 0.1
            visible: root._lastCover !== ""
        }

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 12
            spacing: 8

            // Top row: spinner cover art + title/artist + app icon
            Row {
                Layout.fillWidth: true
                spacing: 10

                // Spinning cover art thumbnail (AGS cover-art-spinner)
                Rectangle {
                    id: coverBox
                    width: 64
                    height: 64
                    radius: 8
                    clip: true
                    color: Theme.bg

                    border.color: Theme.border

                    AppImage {
                        id: coverImg
                        anchors.fill: parent
                        source: root._lastCover || ""
                    }
                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"
                        radius: 8
                    }
                    // spinning indicator (rotation while playing)
                    Rectangle {
                        anchors.right: parent.right
                        anchors.top: parent.top
                        width: 10
                        height: 10
                        radius: 5
                        color: root.playing ? Theme.accent : Theme.fgDim
                        Behavior on color {
                            ColorAnimation {
                                duration: 200
                            }
                        }
                    }
                    // progress ring while playing (spinner visual)
                    Canvas {
                        id: ringCanvas
                        anchors.fill: parent
                        visible: root.playing
                        function redrawRing() {
                            if (!visible)
                                return;
                            const ctx = getContext("2d");
                            if (!ctx)
                                return;
                            ctx.reset();
                            const len = root.player ? root.player.length : 0;
                            const pos = root.player ? root.player.position : 0;
                            const frac = len > 0 ? pos / len : 0;
                            ctx.beginPath();
                            ctx.strokeStyle = Theme.accent;
                            ctx.lineWidth = 2;
                            ctx.arc(width / 2, height / 2, width / 2 - 4, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * frac);
                            ctx.stroke();
                        }
                        onVisibleChanged: if (visible)
                            redrawRing()
                        // periodic repaint while playing (avoids null-player Connections)
                        Timer {
                            interval: 1000
                            running: ringCanvas.visible
                            repeat: true
                            onTriggered: ringCanvas.redrawRing()
                        }
                    }
                }

                // Title / artist with slide transition (AGS textStack).
                // Explicit width (cover + icon + spacing): the dead
                // Layout.fillWidth left this at 0 and no text showed.
                Item {
                    id: trackBlock
                    width: parent.width - 64 - 22 - 20
                    height: 64
                    clip: true

                    Column {
                        id: textLayer
                        width: parent.width
                        spacing: 2
                        anchors.verticalCenter: parent.verticalCenter

                        Label {
                            id: titleLabel
                            width: parent.width
                            elide: Text.ElideRight
                            font.pixelSize: Theme.fontSize + 1
                            font.bold: true
                            color: Theme.fg
                            text: root.title
                        }
                        Label {
                            width: parent.width
                            elide: Text.ElideRight
                            font.pixelSize: Theme.fontSize - 1
                            color: Theme.muted
                            text: root.artist
                        }
                    }
                    NumberAnimation {
                        id: slideAnim
                        target: textLayer
                        property: "anchors.verticalCenterOffset"
                        duration: 200
                        easing.type: Easing.OutCubic
                    }
                }

                // App icon (AGS identity tooltip + entry icon)
                Label {
                    width: 22
                    height: 64
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    text: "\u{F1FE}"  // music-note icon
                    color: Theme.fgDim
                    font.pixelSize: 18
                    AppTooltip {
                        visible: iconTip.hovered
                        text: root.player?.identity ?? ""
                    }
                    HoverHandler {
                        id: iconTip
                    }
                }
            }

            // Flexible spacer: absorbs extra vertical space when the
            // widget is stretched (e.g. app-launcher left pane), pinning
            // controls + slider toward the bottom while keeping the
            // compact 170px layout unchanged (minimum height 6).
            Item {
                Layout.fillWidth: true
                Layout.fillHeight: true
                Layout.minimumHeight: 6
                Layout.preferredHeight: 6
            }

            // Position/length + controls
            // RowLayout with compressible buttons + spacers: the 5-piece
            // controls row (pos, prev, play, next, len) cannot fit the
            // narrow panel at natural widths, so buttons/spacers shrink
            // to their minimums instead of painting past the parent.
            RowLayout {
                Layout.fillWidth: true
                spacing: 3

                Label {
                    Layout.alignment: Qt.AlignVCenter
                    text: root.fmt(root.scrubbing ? root.scrubPos : (root.player?.position ?? 0))
                    color: Theme.fgDim
                    font.pixelSize: Theme.fontSize - 2
                    verticalAlignment: Text.AlignVCenter
                }

                Item {
                    Layout.fillWidth: true
                    Layout.minimumWidth: 0
                }

                // prev
                AppButton {
                    enabled: root.player?.canGoPrevious ?? false
                    icon: "\uf060"
                    pixelSize: 14
                    Layout.preferredWidth: 30
                    Layout.minimumWidth: 22
                    onClicked: root.player?.previous()
                }
                // play/pause
                AppButton {
                    enabled: root.player?.canPause ?? (root.player?.canPlay ?? false)
                    icon: root.playing ? "\uf04c" : "\uf04b"
                    pixelSize: 14
                    cornerRadius: 16
                    Layout.preferredWidth: 30
                    Layout.minimumWidth: 22
                    implicitHeight: 30
                    idleBg: Theme.surfaceActive
                    idleFg: Theme.accent
                    onClicked: {
                        if (root.playing)
                            root.player?.pause();
                        else
                            root.player?.play();
                    }
                }
                // next
                AppButton {
                    enabled: root.player?.canGoNext ?? false
                    icon: "\uf061"
                    pixelSize: 14
                    Layout.preferredWidth: 30
                    Layout.minimumWidth: 22
                    onClicked: root.player?.next()
                }

                Item {
                    Layout.fillWidth: true
                    Layout.minimumWidth: 0
                }

                Label {
                    Layout.alignment: Qt.AlignVCenter
                    text: root.fmt(root.player?.length ?? 0)
                    color: Theme.fgDim
                    font.pixelSize: Theme.fontSize - 2
                    verticalAlignment: Text.AlignVCenter
                }
            }

            // Drag-scrubbable position slider (AGS GestureDrag scrub)
            Rectangle {
                id: progBg
                Layout.fillWidth: true
                Layout.minimumHeight: 6
                Layout.preferredHeight: 6
                height: 6
                radius: 3
                color: Theme.bg

                border.color: Theme.border

                property real frac: root.scrubbing ? (root.scrubPos / Math.max(1, root.player?.length ?? 1)) : (root.player?.length ?? 0) > 0 ? (root.player?.position ?? 0) / root.player.length : 0
                property real fill: Math.max(0, Math.min(1, frac))

                Rectangle {
                    id: progFill
                    width: progBg.width * progBg.fill
                    height: 6
                    radius: 3
                    color: Theme.accent
                }

                MouseArea {
                    anchors.fill: parent
                    enabled: root.player?.canSeek ?? false
                    cursorShape: Qt.PointingHandCursor
                    onPressed: mouse => {
                        root.scrubbing = true;
                        root.scrubPos = mouse.x / width * (root.player?.length ?? 0);
                    }
                    onPositionChanged: mouse => {
                        if (root.scrubbing)
                            root.scrubPos = mouse.x / width * (root.player?.length ?? 0);
                    }
                    onReleased: mouse => {
                        if (root.scrubbing) {
                            root.scrubPos = mouse.x / width * (root.player?.length ?? 0);
                            root.player?.seek(root.scrubPos);
                            root.scrubbing = false;
                        }
                    }
                }
            }
        }
    }

    // No player state — fill parent so empty state also expands
    // vertically (e.g. app-launcher left pane) instead of staying 170px.
    Item {
        visible: root.player === null
        anchors.fill: parent
        Label {
            anchors.centerIn: parent
            text: "No player found"
            font.pixelSize: Theme.fontSize
            color: Theme.fgDim
        }
    }
}
