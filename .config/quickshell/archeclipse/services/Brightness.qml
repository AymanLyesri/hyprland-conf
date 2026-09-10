pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io

// Port of services/brightness.ts — manages screen brightness via brightnessctl
// across all available backlight devices.
QtObject {
    id: root

    property real screen: 0
    property bool hasBacklight: false
    property var _devices: []
    property int _primaryMax: 1
    property bool _maxKnown: false
    property string _primaryDevice: ""

    // Live brightness tracking — the kernel emits inotify MODIFY events on
    // /sys/class/backlight/*/brightness for every change (verified), so
    // FileView delivers instant, zero-poll updates for our own writes and
    // external ones (e.g. Hyprland-bound brightness keys) alike.
    property FileView _brightnessView: FileView {
        watchChanges: true
        onFileChanged: reload()
        onLoaded: {
            if (!root._maxKnown || root._primaryMax <= 0)
                return;
            const v = Number(text().trim());
            if (!isNaN(v))
                root.screen = v / root._primaryMax;
        }
    }

    // Process for initial device detection
    property Process _detectProc: Process {
        command: ["/bin/ls", "-1", "/sys/class/backlight"]
        stdout: StdioCollector {
            onStreamFinished: {
                root._devices = text.trim().split("\n").filter(d => d.length > 0);
                if (root._devices.length > 0) {
                    root._primaryDevice = root._devices[0];
                    root.hasBacklight = true;
                    root._brightnessView.path = "/sys/class/backlight/" + root._primaryDevice + "/brightness";
                    root._maxProc.command = ["brightnessctl", "--device=" + root._primaryDevice, "max"];
                    root._maxProc.running = true;
                }
            }
        }
    }

    // Process for reading max brightness
    property Process _maxProc: Process {
        stdout: StdioCollector {
            onStreamFinished: {
                root._primaryMax = Number(text.trim()) || 1;
                root._maxKnown = true;
                // Max may arrive after the first file load — re-parse now.
                root._brightnessView.reload();
            }
        }
    }

    // Process for setting brightness — driven by a serial queue (AGS
    // brightness.ts:61-64 fans out to ALL devices; a single reused Process
    // cannot run N commands from a loop — running=true while running is a
    // no-op — so chain one device per exit).
    property var _setQueue: []
    property Process _setBrightnessProc: Process {
        stderr: StdioCollector {
            onStreamFinished: {
                if (text.trim()) {
                    console.warn("[Brightness] Failed to set brightness: " + text);
                }
            }
        }
        onExited: root._pumpSetQueue()
    }

    function _pumpSetQueue() {
        if (root._setQueue.length === 0) return;
        const next = root._setQueue.shift();
        root._setBrightnessProc.command = next;
        root._setBrightnessProc.running = true;
    }

    // Initialize - run detection on startup (live file events take over
    // from there — no polling anywhere).
    Component.onCompleted: {
        root._detectProc.running = true;
    }

    // Setter for screen property (0-1)
    function setScreen(percent) {
        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;
        if (Math.abs(root.screen - percent) < 0.001) return;
        if (root._devices.length === 0) return;

        root.screen = percent;
        const targetPercent = Math.floor(percent * 100);

        // Set on all devices sequentially via the serial queue
        root._setQueue = root._devices.map(dev => ["brightnessctl", "--device=" + dev, "set", targetPercent + "%", "-q"]);
        if (!root._setBrightnessProc.running) root._pumpSetQueue();
    }
}