//@ pragma UseQApplication
import QtQuick
import Quickshell
import Quickshell.Io
import qs.services
import qs.widgets.bar
import qs.widgets.launcher
import qs.widgets.leftPanel
import qs.widgets.media
import qs.widgets.notifications
import qs.widgets.overlays
import qs.widgets.rightPanel
import qs.widgets.userPanel

// ArchEclipse shell — multi-monitor via Variants over Quickshell.screens.
// Each window is instantiated once per monitor (matching AGS perMonitorDisplay).
ShellRoot {
    // FileView won't create missing parent dirs, so ensure every cache
    // dir it writes to exists at startup (else writes silently fail).
    property Process _cacheDirsProc: Process {
        command: ["bash", "-c", "mkdir -p \"$HOME/.cache/quickshell/settings\" \"$HOME/.cache/quickshell/booru\" \"$HOME/.cache/cwal\" \"$HOME/.cache/quickshell/launcher\" \"$HOME/.cache/quickshell/script-timer\" \"$HOME/.cache/quickshell/crypto\" \"$HOME/.cache/quickshell/thumbnails/custom\" \"$HOME/.cache/quickshell/chatbot\" \"$HOME/.cache/quickshell/auth\" \"$HOME/.cache/quickshell/manga\" \"$HOME/.config/fastfetch/cache\""]
    }
    Component.onCompleted: _cacheDirsProc.running = true

    Ipc {
    }

    // per-monitor notification popups
    Variants {
        model: Quickshell.screens

        NotificationPopups {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // per-monitor bar (the main reference implementation)
    Variants {
        model: Quickshell.screens

        Bar {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // per-monitor bar edge-hover strip (dwell-reveals the auto-hidden bar)
    Variants {
        model: Quickshell.screens

        BarHoverWindow {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // per-monitor wallpaper switcher (bottom overlay)
    Variants {
        model: Quickshell.screens

        WallpaperSwitcher {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // per-monitor user panel (full-screen power grid overlay)
    Variants {
        model: Quickshell.screens

        UserPanel {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // Left panel (SUPER+L, hot-zone, IPC)
    Variants {
        model: Quickshell.screens

        LeftPanel {
            required property ShellScreen modelData

            screen: modelData
        }

    }

    // Right panel (SUPER+R, hot-zone, IPC)
    Variants {
        model: Quickshell.screens

        RightPanel {
            required property ShellScreen modelData

            screen: modelData
        }

    }

}
