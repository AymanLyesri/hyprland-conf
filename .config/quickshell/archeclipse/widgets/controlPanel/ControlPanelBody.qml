import QtQuick
import QtQuick.Controls
import Quickshell
import Quickshell.Services.Pipewire
import qs.theme
import qs.services
import qs.widgets.shared

// Quick-settings body: volume + brightness sliders + action buttons.
// Extracted verbatim from the old ControlPanel sidebar so it can live in
// the bar's dynamic island (ControlIsland) instead of a side window.
// Close behavior = BarState.deactivate("control").
Item {
    id: body

    property string monitorName: ""
    readonly property string effectiveMonitor: body.monitorName || Registry.monitorName

    width: 320
    height: contentCol.height + 32

    // ---- default sink for the volume slider ----
    readonly property PwNode controlSink: Pipewire.defaultAudioSink
    PwObjectTracker {
        objects: [controlSink]
    }

    // ---- dynamic brightness icon (matches AGS 3-level thresholds) ----
    readonly property string brightnessIcon: {
        const bri = Brightness.screen;
        if (bri > 0.75)
            return "\u{F00E0}";       // full (󰃠)
        if (bri > 0.5)
            return "\u{F00DF}";        // medium (󰃟)
        return "\u{F00DE}";                        // low (󰃞)
    }

    // ---- content ----
    Column {
        id: contentCol
        width: parent.width
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 16
        spacing: 16

        // ===== Volume =====
        Column {
            width: parent.width
            spacing: 6
            Row {
                width: parent.width
                spacing: 8
                Text {
                    text: VolumeWatcher.volumeIcon
                    color: Theme.foreground
                    font.family: "JetBrainsMono NFP"
                    font.pixelSize: 18
                    verticalAlignment: Text.AlignVCenter
                }
                Text {
                    text: "Volume"
                    color: Theme.foregroundSecondary
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 1
                }
            }
            AppSlider {
                id: volSlider
                width: parent.width
                from: 0
                to: 1
                stepSize: 0.01
                value: body.controlSink?.audio?.volume ?? 0
                onMoved: if (body.controlSink?.audio)
                    body.controlSink.audio.volume = volSlider.value
            }
        }

        // ===== Brightness =====
        Column {
            width: parent.width
            spacing: 6
            visible: Brightness.hasBacklight
            Row {
                width: parent.width
                spacing: 8
                Text {
                    text: body.brightnessIcon
                    color: Theme.foreground
                    font.family: "JetBrainsMono NFP"
                    font.pixelSize: 18
                    verticalAlignment: Text.AlignVCenter
                }
                Text {
                    text: "Brightness"
                    color: Theme.foregroundSecondary
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize - 1
                }
            }
            AppSlider {
                id: brightSlider
                width: parent.width
                from: 0
                to: 1
                stepSize: 0.01
                value: Brightness.screen
                onMoved: Brightness.setScreen(brightSlider.value)
            }
        }

        // ===== Action buttons =====
        Row {
            width: parent.width
            spacing: 10
            // Theme toggle
            Rectangle {
                width: 46
                height: 46
                radius: Theme.radius
                color: tm.containsMouse ? Theme.buttonHoverBg : Theme.moduleBg
                ToolTip.visible: tm.containsMouse
                ToolTip.text: GlobalTheme.currentTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
                ToolTip.delay: 600
                Text {
                    anchors.centerIn: parent
                    text: GlobalTheme.currentTheme ? "\u{F07C5}" : "\u{F0D9C}"
                    color: Theme.foreground
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize + 2
                }
                MouseArea {
                    id: tm
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: GlobalTheme.setTheme(!GlobalTheme.currentTheme)
                }
            }
            // DND toggle
            Rectangle {
                id: dndBtn
                width: 46
                height: 46
                radius: Theme.radius
                color: (dndM.containsMouse || Settings.notifDnd || dndPing) ? Theme.buttonCheckedBg : Theme.moduleBg
                ToolTip.visible: dndM.containsMouse
                ToolTip.text: Settings.notifDnd ? "Disable Do Not Disturb" : "Enable Do Not Disturb"
                ToolTip.delay: 600
                Text {
                    anchors.centerIn: parent
                    text: Settings.notifDnd ? "\u{F0436}" : "\u{F044E}"
                    color: Settings.notifDnd ? Theme.buttonCheckedFg : Theme.foreground
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize + 2
                }
                MouseArea {
                    id: dndM
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: Settings.updateSetting("notifications.dnd", !Settings.notifDnd)
                }
                // AGS DndToggle: ping the button ~600ms when a notification
                // arrives while DND is active, reset when DND turns off
                property bool dndPing: false
                Connections {
                    target: Notifications
                    function onNotified() {
                        if (Settings.notifDnd)
                            dndBtn.dndPing = true;
                        if (dndPingTimer.running)
                            dndPingTimer.restart();
                        else
                            dndPingTimer.start();
                    }
                }
                Connections {
                    target: Settings
                    function onNotifDndChanged() {
                        if (!Settings.notifDnd)
                            dndBtn.dndPing = false;
                    }
                }
                Timer {
                    id: dndPingTimer
                    interval: 600
                    onTriggered: dndBtn.dndPing = false
                }
            }
            // UserPanel (SUPER+ESC)
            Rectangle {
                width: 46
                height: 46
                radius: Theme.radius
                color: upM.containsMouse ? Theme.buttonHoverBg : Theme.moduleBg
                ToolTip.visible: upM.containsMouse
                ToolTip.text: "User Panel\n<b>SUPER + ESC</b>"
                ToolTip.delay: 600
                Text {
                    anchors.centerIn: parent
                    text: "\u{F058C}"
                    color: Theme.foreground
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize + 2
                }
                MouseArea {
                    id: upM
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        BarState.deactivate("control");
                        Registry.toggle(`user-panel-${body.effectiveMonitor}`);
                    }
                }
            }
            // AppLauncher (SUPER)
            Rectangle {
                width: 46
                height: 46
                radius: Theme.radius
                color: alM.containsMouse ? Theme.buttonHoverBg : Theme.moduleBg
                ToolTip.visible: alM.containsMouse
                ToolTip.text: "App Launcher\n<b>SUPER</b>"
                ToolTip.delay: 600
                Text {
                    anchors.centerIn: parent
                    text: "\u{F0580}"
                    color: Theme.foreground
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize + 2
                }
                MouseArea {
                    id: alM
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        BarState.deactivate("control");
                        BarState.activate("search", 0);
                    }
                }
            }
            // WallpaperSwitcher (SUPER+W)
            Rectangle {
                width: 46
                height: 46
                radius: Theme.radius
                color: wsM.containsMouse ? Theme.buttonHoverBg : Theme.moduleBg
                ToolTip.visible: wsM.containsMouse
                ToolTip.text: "Wallpaper Switcher\n<b>SUPER + W</b>"
                ToolTip.delay: 600
                Text {
                    anchors.centerIn: parent
                    text: "\u{F0F82}"
                    color: Theme.foreground
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSize + 2
                }
                MouseArea {
                    id: wsM
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        BarState.deactivate("control");
                        if (BarState.state === "wallpaper")
                            BarState.deactivate("wallpaper");
                        else
                            BarState.activate("wallpaper", 0);
                    }
                }
            }
        }
    }
}
