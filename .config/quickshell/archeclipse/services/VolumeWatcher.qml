pragma Singleton
import QtQuick
import Quickshell.Services.Pipewire

// Shared default-sink tracking: used by the volume widget and by BarState's
// volume-pulse watcher so only one PwObjectTracker exists.
QtObject {
    id: root

    readonly property PwNode sink: Pipewire.defaultAudioSink
    readonly property PwObjectTracker tracker: PwObjectTracker {
        objects: [root.sink]
    }

    readonly property real volume: {
        if (!sink?.audio)
            return 0;
        const v = sink.audio.volume;
        return isNaN(v) || v < 0 ? 0 : (v > 1 ? 1 : v);
    }

    readonly property PwNode controlSink: Pipewire.defaultAudioSink
    readonly property string volumeIcon: {
        const vol = controlSink?.audio?.volume ?? 0;
        if (vol <= 0)
            return "\uf026"; // muted (󰑖)
        if (vol < 0.33)
            return "\uf027"; // low (󰑘)
        if (vol < 0.66)
            return "\uefcf"; // medium (󰑗)
        return "\uf028"; // high (󰑙)
    }
}
