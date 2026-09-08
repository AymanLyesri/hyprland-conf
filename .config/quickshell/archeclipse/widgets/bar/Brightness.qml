import QtQuick
import Quickshell
import Quickshell.Io
import qs.theme
import qs.services
import qs.widgets.shared

Rectangle {
    id: root

    property real level: 1.0
    property bool pulse: false
    readonly property int fixedWidth: 220

    // AGS: visible only when a backlight exists (no /sys/class/backlight/*
    // on desktops → hidden). Single source of truth is the Brightness
    // service; the old local `backlightCheck.outputLines` read a
    // non-existent StdioCollector property, threw, and the catch{}
    // returned true — so the icon showed on desktops.
    readonly property bool hasBacklight: Brightness.hasBacklight

    width: pulse ? fixedWidth : content.width
    height: 22
    radius: Theme.radius
    color: pulse ? Theme.surface : "transparent"
    visible: root.hasBacklight

    Process {
        id: getBri
        command: ["sh", "-c", "brightnessctl -m info"]
        stdout: StdioCollector {
            onStreamFinished: {
                const m = text.split(",");
                if (m.length > 3) {
                    const newLevel = parseFloat(m[3].replace('%', '')) / 100;
                    if (Math.abs(newLevel - root.level) > 0.005) {
                        root.level = newLevel;
                        // AGS: reveal slider on external change, then auto-hide after 2s
                        root.showSliderTemp();
                    }
                }
            }
        }
    }
    Timer {
        interval: 15000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: getBri.running = true
    }

    // AGS change → reveal + 2s hide timeout
    property bool sliderRevealed: false
    property bool keepOpen: false
    function showSliderTemp() {
        root.sliderRevealed = true;
        hideTimer.restart();
    }
    function hideSlider() {
        if (!root.keepOpen)
            root.sliderRevealed = false;
    }
    Timer {
        id: hideTimer
        interval: 2000
        onTriggered: root.hideSlider()
    }

    Row {
        id: content
        anchors.verticalCenter: parent.verticalCenter
        spacing: Theme.spacing

        Text {
            anchors.verticalCenter: parent.verticalCenter
            text: root.level > 0.75 ? "\udb80\udce0" : root.level > 0.5 ? "\udb80\udcdf" : "\udb80\udcde"
            color: Theme.fg
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize + 1
        }
        Text {
            anchors.verticalCenter: parent.verticalCenter
            text: Math.round(root.level * 100) + "%"
            color: Theme.fg
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize
        }
        AppSlider {
            id: briSlider
            visible: root.pulse || root.sliderRevealed || briHover.hovered
            width: visible ? 100 : 0
            anchors.verticalCenter: parent.verticalCenter
            from: 0.01
            to: 1
            stepSize: 0.01
            value: root.level
            onMoved: {
                root.level = briSlider.value;
                Quickshell.execDetached(["brightnessctl", "set", Math.round(briSlider.value * 100) + "%"]);
            }
        }
    }

    // AGS EventControllerMotion: hover keeps reveal open, cancel+restart 2s on leave
    HoverHandler {
        id: briHover
        onHoveredChanged: {
            if (briHover.hovered) {
                root.keepOpen = true;
                root.sliderRevealed = true;
                hideTimer.stop();
            } else {
                root.keepOpen = false;
                hideTimer.restart();
            }
        }
    }
}
