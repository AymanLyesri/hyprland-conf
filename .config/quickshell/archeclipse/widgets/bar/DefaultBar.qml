import QtQuick
import QtQuick.Controls
import Quickshell
import Quickshell.Widgets
import Quickshell.Services.Mpris
import qs.theme
import qs.services
import qs.widgets.bar
import qs.widgets.shared
import qs.widgets.weather

// Center section (ex-Information) is inlined here directly:
// player pill + clock + keyboard layout + bandwidth + weather (+ crypto favorite).
// Top row holds all content; the workspace strip sits at the very bottom,
// stretched across the full bar width.
Column {
    id: root
    spacing: 4

    // ---- media player state (ex-Information firstPlayable logic) ----
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
    readonly property bool isPlaying: {
        const p = root.firstPlayable;
        if (!p)
            return false;
        if (p.isPlaying !== undefined)
            return p.isPlaying;
        return p.playbackState === MprisPlaybackState.Playing;
    }
    readonly property string playerTitleText: {
        const p = root.firstPlayable;
        if (!p)
            return "";
        return p.trackTitle ?? "";
    }

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

    Item {
        id: topRow
        // Both side sections count as wide as the wider one, so the
        // centered clock always keeps at least Theme.spacing clearance
        // from either side instead of clipping into the wider section.
        // The weather button stretches to absorb any slack on the left.
        readonly property real leftMinWidth: fixedRow.implicitWidth + Theme.spacing + weatherButton.implicitWidth + Theme.spacing + resourceMonitor.implicitWidth + Theme.spacing + bandwidthRow.implicitWidth
        readonly property real sideWidth: Math.max(leftMinWidth, utilities.implicitWidth)
        implicitWidth: 2 * sideWidth + clockItem.width + Theme.spacing * 2
        width: implicitWidth
        height: Theme.barContentHeight

        Clock {
            id: clockItem
            anchors.horizontalCenter: parent.horizontalCenter
            anchors.verticalCenter: parent.verticalCenter
        }

        // left zone — fixed sideWidth; weather stretches into the slack
        Item {
            id: leftZone
            anchors.left: parent.left
            anchors.verticalCenter: parent.verticalCenter
            width: topRow.sideWidth
            height: parent.height

            Row {
                id: fixedRow
                spacing: Theme.spacing
                height: parent.height
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter

                // media pill (AGS PlayerWidget parity: app icon + track title;
                // hover/click pulses the full player island)
                Rectangle {
                    id: playerPill
                    visible: root.firstPlayable !== null
                    width: visible ? contentRow.width + 16 : 0
                    height: Theme.barContentHeight
                    radius: Theme.radius
                    color: playerHover.hovered ? Theme.surfaceHover : "transparent"
                    anchors.verticalCenter: parent.verticalCenter

                    Behavior on color {
                        ColorAnimation {
                            duration: 150
                        }
                    }

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
                            text: root.playerTitleText
                            elide: Text.ElideRight
                            width: Math.min(implicitWidth, 180)
                            color: Theme.fg
                            font.family: Theme.fontFamily
                            font.pixelSize: Theme.fontSize
                        }
                    }

                    AppTooltip {
                        visible: playerHover.hovered && root.playerTooltip !== ""
                        text: root.playerTooltip
                        delay: 500
                    }

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
            } // fixedRow

            WeatherButton {
                id: weatherButton
                anchors.left: fixedRow.right
                anchors.leftMargin: Theme.spacing
                anchors.right: resourceMonitor.left
                anchors.rightMargin: Theme.spacing
                anchors.verticalCenter: parent.verticalCenter
            }

            ResourceMonitor {
                id: resourceMonitor
                anchors.right: bandwidthRow.left
                anchors.rightMargin: Theme.spacing
                anchors.verticalCenter: parent.verticalCenter
            }

            // bandwidth compact (up/down from SysInfo loop) — after weather
            Row {
                id: bandwidthRow
                spacing: 4
                height: parent.height
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                Text {
                    text: Math.round(SysInfo.bandwidth[0]) + ""
                    color: Theme.fg
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize
                }
                Text {
                    text: ""
                    color: Theme.muted
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 2
                }
                Text {
                    text: Math.round(SysInfo.bandwidth[1]) + ""
                    color: Theme.fg
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize
                }
                Text {
                    text: ""
                    color: Theme.muted
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 2
                }
            }
        } // leftZone

        Row {
            id: utilities
            spacing: Theme.spacing
            height: parent.height
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter

            ControlPanelButton {}
            Battery {}
            Brightness {}
            Volume {}
            Tray {}
        }
    } // topRow

    // bottom workspace strip — full width of the bar content
    Workspaces {
        width: topRow.implicitWidth
    }
}
