import QtQuick
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Mpris
import qs.theme
import qs.services
import qs.widgets.rightPanel
import qs.widgets.weather

// Port of Information.tsx (center section):
// player (if any playable MPRIS player) + clock + keyboard layout + bandwidth
// (+ crypto favorite, hidden while unset — same as AGS).
Row {
    id: root
    spacing: Theme.spacing
    height: 24

    // ---- media (PlayerWidget presence logic, AGS parity: app icon +
    // track title in a pill; hover/click pulses the full player island) ----
    readonly property var firstPlayable: {
        Mpris.players.values;   // reactive dep
        for (const p of Mpris.players.values) {
            // touch reactive props so title / play-state changes re-fire
            const _t = p.trackTitle;
            const _s = p.playbackState;
            if ((_t ?? "").trim() !== "" || _s === MprisPlaybackState.Playing)
                return p;
        }
        return null;
    }
    readonly property bool isPlaying: root.firstPlayable?.isPlaying ?? (root.firstPlayable?.playbackState === MprisPlaybackState.Playing)

    // Resolve the player's app icon via its MPRIS DesktopEntry (AGS
    // AstalApps.exact_query(player.entry) parity) with identity fallbacks.
    readonly property string playerIconSource: {
        const p = root.firstPlayable;
        if (!p)
            return "";
        const de = (p.desktopEntry ?? "").trim();
        const id = (p.identity ?? "").trim();
        let entry = null;
        try {
            if (de !== "")
                entry = DesktopEntries.byId(de) ?? DesktopEntries.heuristicLookup(de);
            if (!entry && id !== "")
                entry = DesktopEntries.heuristicLookup(id);
        } catch (e) {}
        if (entry && entry.icon)
            return entry.icon;
        // IconImage resolves theme names — lowercase identity usually
        // matches (e.g. "Spotify" -> "spotify"); dbus suffix as last resort.
        if (id !== "")
            return id.toLowerCase();
        const bus = (p.dbusName ?? "").trim();
        if (bus !== "") {
            const tail = bus.split(".").pop();
            if (tail)
                return tail.toLowerCase();
        }
        return "";
    }
    readonly property string playerTooltip: {
        const p = root.firstPlayable;
        if (!p)
            return "";
        const id = (p.identity ?? "").trim();
        const artist = (p.trackArtist ?? "").trim();
        const title = (p.trackTitle ?? "").trim();
        const track = artist !== "" ? artist + " — " + title : title;
        return (id !== "" ? id : "Player") + (track !== "" ? "\n" + track : "");
    }

    Rectangle {
        id: playerPill
        visible: root.firstPlayable !== null
        width: visible ? contentRow.width + 16 : 0
        height: 22
        radius: Theme.radius
        color: playerHover.hovered ? Theme.surfaceHover : "transparent"
        anchors.verticalCenter: parent.verticalCenter

        Behavior on color { ColorAnimation { duration: 150 } }

        Row {
            id: contentRow
            anchors.centerIn: parent
            spacing: 6

            // app icon (fallback: music-note glyph like AGS empty state)
            Item {
                width: 14
                height: 14
                anchors.verticalCenter: parent.verticalCenter

                IconImage {
                    id: playerIcon
                    anchors.fill: parent
                    source: root.playerIconSource
                    visible: status === Image.Ready && root.playerIconSource !== ""
                    asynchronous: true
                }
                Text {
                    visible: !playerIcon.visible
                    anchors.centerIn: parent
                    text: "󰎈"
                    color: Theme.muted
                    font.family: Theme.fontFamily
                    font.pixelSize: 12
                }
            }

            // play/pause state glyph
            Text {
                anchors.verticalCenter: parent.verticalCenter
                text: root.isPlaying ? "" : ""
                color: root.isPlaying ? Theme.accent : Theme.muted
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize - 2
            }

            Text {
                id: playerTitle
                anchors.verticalCenter: parent.verticalCenter
                text: root.firstPlayable?.trackTitle ?? ""
                elide: Text.ElideRight
                width: Math.min(implicitWidth, 180)
                color: Theme.fg
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize
            }
        }

        ToolTip.visible: playerHover.hovered && root.playerTooltip !== ""
        ToolTip.text: root.playerTooltip
        ToolTip.delay: 500

        HoverHandler {
            id: playerHover
            onHoveredChanged: {
                if (playerHover.hovered && root.firstPlayable)
                    BarState.activate("player", 2500);
            }
        }
        MouseArea {
            anchors.fill: parent
            acceptedButtons: Qt.LeftButton | Qt.MiddleButton
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: mouse => {
                if (!root.firstPlayable)
                    return;
                if (mouse.button === Qt.MiddleButton) {
                    root.firstPlayable.togglePlaying();
                    return;
                }
                BarState.activate("player", 2500);
            }
        }
    }

    Clock {
        anchors.verticalCenter: parent.verticalCenter
        height: 22
    }

    KeyboardLayoutWidget {
    }

    // ---- bandwidth (Bandwidth.tsx compact form) ----
    Row {
        spacing: 4
        anchors.verticalCenter: parent.verticalCenter
        Text { text: SysInfo.bandwidth[0] + ""; color: Theme.fg; font.family: Theme.fontFamily; font.pixelSize: Theme.fontSize }
        Text { text: "\uF062"; color: Theme.muted; font.family: Theme.fontFamily; font.pixelSize: Theme.fontSize - 2 }
        Text { text: SysInfo.bandwidth[1] + ""; color: Theme.fg; font.family: Theme.fontFamily; font.pixelSize: Theme.fontSize }
        Text { text: "\uF063"; color: Theme.muted; font.family: Theme.fontFamily; font.pixelSize: Theme.fontSize - 2 }
    }

    // ---- weather button (AGS WeatherButton) ----
    WeatherButton {
        anchors.verticalCenter: parent.verticalCenter
    }

    // ---- pinned crypto favorite (AGS Information crypto.favorite, click-to-remove) ----
    Item {
        id: favBox
        visible: Settings.cryptoFavorite && (Settings.cryptoFavorite.symbol || "") !== ""
        width: favItem.width + 4
        height: 22
        anchors.verticalCenter: parent.verticalCenter

        CryptoItem {
            id: favItem
            anchors.verticalCenter: parent.verticalCenter
            width: 170
            entry: Settings.cryptoFavorite
            property bool horizontal: true
            itemWidth: 170
            anchors.left: parent.left
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: {
                Settings.cryptoFavorite = { symbol: "", timeframe: "" }
                Settings.updateSetting("crypto.favorite", Settings.cryptoFavorite)
            }
        }
    }
}