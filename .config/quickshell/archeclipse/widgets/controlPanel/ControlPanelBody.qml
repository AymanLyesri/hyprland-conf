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

    // ---- dynamic brightness icon (3-level thresholds) ----
    readonly property string brightnessIcon: {
        const bri = Brightness.screen;
        if (bri > 0.75)
            return "\u{F00E0}";       // full (󰃠)
        if (bri > 0.5)
            return "\u{F00DF}";        // medium (󰃟)
        return "\u{F00DE}";                        // low (󰃞)
    }

    // DND ping state: highlight the DND button ~600ms when a
    // notification arrives while DND is active (AppButton `checked` drives
    // the highlight, so the flag lives here instead of on a Rectangle).
    property bool dndPing: false
    Connections {
        target: Notifications
        function onNotified() {
            if (Settings.notifDnd)
                body.dndPing = true;
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
                body.dndPing = false;
        }
    }
    Timer {
        id: dndPingTimer
        interval: 600
        onTriggered: body.dndPing = false
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
                    color: Theme.fg
                    font.family: "JetBrainsMono NFP"
                    font.pixelSize: 18
                    verticalAlignment: Text.AlignVCenter
                }
                Text {
                    text: "Volume"
                    color: Theme.muted
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
                    color: Theme.fg
                    font.family: "JetBrainsMono NFP"
                    font.pixelSize: 18
                    verticalAlignment: Text.AlignVCenter
                }
                Text {
                    text: "Brightness"
                    color: Theme.muted
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

        // ===== Action buttons (shared AppButton cells) =====
        Row {
            width: parent.width
            spacing: 10
            // Theme toggle
            AppButton {
                width: 46
                height: 46
                cornerRadius: Theme.radius
                idleBg: Theme.surface
                icon: GlobalTheme.currentTheme ? "\uf185" : "\uf186"
                pixelSize: Theme.fontSize + 2
                tooltipText: GlobalTheme.currentTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
                onClicked: GlobalTheme.setTheme(!GlobalTheme.currentTheme)
            }
            // DND toggle
            AppButton {
                width: 46
                height: 46
                cornerRadius: Theme.radius
                idleBg: Theme.surface
                icon: Settings.notifDnd ? "\uf1f6" : "\uf0f3"
                pixelSize: Theme.fontSize + 2
                toggle: true
                checked: Settings.notifDnd || body.dndPing
                tooltipText: Settings.notifDnd ? "Disable Do Not Disturb" : "Enable Do Not Disturb"
                onClicked: Settings.updateSetting("notifications.dnd", !Settings.notifDnd)
            }
            AppButton {
                width: 46
                height: 46
                cornerRadius: Theme.radius
                idleBg: Theme.surface
                icon: "\udb83\ude09"
                pixelSize: Theme.fontSize + 2
                tooltipText: "Wallpaper Switcher\n<b>SUPER + W</b>"
                onClicked: {
                    BarState.deactivate("control");
                    if (BarState.state === "wallpaper")
                        BarState.deactivate("wallpaper");
                    else
                        BarState.activate("wallpaper", 0);
                }
            }
            // Keyboard layout — shows the current layout code, click cycles
            AppButton {
                width: 46
                height: 46
                cornerRadius: Theme.radius
                idleBg: Theme.surface
                text: KeyboardLayout.layout
                visible: KeyboardLayout.layout !== ""
                pixelSize: Theme.fontSize + 2
                tooltipText: (KeyboardLayout.layoutName || "Keyboard Layout") + "\nClick to switch layout"
                onClicked: KeyboardLayout.nextLayout()
            }
        }
    }
}
