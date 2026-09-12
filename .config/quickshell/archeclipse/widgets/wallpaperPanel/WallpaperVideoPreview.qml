import QtQuick
import QtMultimedia
import Quickshell.Widgets
import qs.theme

// WallpaperVideoPreview — live muted loop of an MP4/WebM wallpaper inside
// a switcher tile. Same lifecycle discipline as MediaVideo (source is
// gated on `active`, teardown stops + unloads), plus:
//
// - always muted (AudioOutput.muted): previews never expose audio.
// - PreserveAspectCrop: crops exactly like the static AppImage previews.
// - `ready` (first frame or decode failure) drives the tile's staggered
//   fade-in; failures keep the layout and fall back to the tile's icon.
//
// The host tile sets `active` from viewport visibility so only on-screen
// delegates hold a decoder — off-screen tiles unload their source.
// No thumbnail files, no external converters.
ClippingRectangle {
    id: root

    property string source: ""   // local file path (no file:// prefix)
    property bool active: false  // in-viewport && switcher open
    property bool loop: true
    readonly property bool ready: player.hasVideo || _failed
    property bool _failed: false
    // Native video dimensions for hover-expand parity with image tiles
    // (the tile widens to the preview's aspect ratio). Unknown until
    // metadata arrives — (0,0) means "not known yet", same as an
    // undecoded Image's implicit size.
    readonly property size videoSize: {
        try {
            const r = player.metaData.value(MediaMetaData.Resolution);
            if (r !== undefined && r.width > 0 && r.height > 0)
                return Qt.size(r.width, r.height);
        } catch (e) {
            if (!root._ratioWarned) {
                root._ratioWarned = true;
                console.warn("[WallpaperSwitcher] video resolution lookup failed: " + e);
            }
        }
        return Qt.size(0, 0);
    }
    property bool _ratioWarned: false
    readonly property real videoRatio: (videoSize.width > 0 && videoSize.height > 0) ? videoSize.width / videoSize.height : 0

    radius: Theme.radius
    color: "transparent"

    MediaPlayer {
        id: player
        // Gate the source on active: an unloaded player holds no decoder,
        // so scrolled-out delegates cost nothing. (Same pattern as
        // MediaVideo gating on visibility.)
        source: (root.active && root.source !== "") ? "file://" + root.source : ""
        audioOutput: AudioOutput {
            // Previews are visual only — never play wallpaper audio.
            muted: true
        }
        videoOutput: videoOut
        loops: root.loop ? MediaPlayer.Infinite : 1
        autoPlay: root.active
        onErrorOccurred: (error, errorString) => {
            // Decode failures are terminal for this source; mark failed
            // once (no per-frame logging) so the tile shows its icon.
            if (!root._failed) {
                root._failed = true;
                console.warn("[WallpaperSwitcher] video preview failed for " + root.source + ": " + errorString);
            }
        }
        onSourceChanged: root._failed = false
    }

    VideoOutput {
        id: videoOut
        anchors.fill: parent
        fillMode: VideoOutput.PreserveAspectCrop
        visible: root.source !== "" && player.hasVideo
    }

    // Teardown mirrors MediaVideo: stop (not pause) so a re-shown tile
    // rebinds a fresh source instead of resuming a stale decode.
    onActiveChanged: {
        if (!active)
            player.stop();
        else if (root.source !== "")
            player.play();
    }
    Component.onDestruction: {
        player.stop();
        player.source = "";
    }
}
