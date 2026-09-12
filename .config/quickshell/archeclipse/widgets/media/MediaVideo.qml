import QtQuick
import QtMultimedia

// MediaVideo — video player widget.
// autoplay=true, loop=true, fills the parent (hexpand/vexpand), with a
// destroy-time teardown that releases the media source (mirrors the old
// gst teardown on unrealize to avoid GL-context crashes on re-init).
Item {
    id: root

    property string source: ""      // local file path (Gio.File.new_for_path equivalent)
    property bool autoplay: true
    property bool loop: true
    property bool fill: true        // if false, letterbox (preserve aspect)

    MediaPlayer {
        id: player
        // Gate the source on visibility: VideoOutput.visible alone does NOT
        // stop decoding — a hidden player fed an image (e.g. WaifuWidget's
        // png with visible:false) loops ffmpeg errors thousands of times
        // per second, filling /run/user/1000 and killing IPC/panels.
        source: (root.visible && root.source !== "") ? "file://" + root.source : ""
        audioOutput: AudioOutput {}
        videoOutput: videoOut
        loops: root.loop ? MediaPlayer.Infinite : 1
        autoPlay: root.autoplay && root.visible
    }

    VideoOutput {
        id: videoOut
        anchors.fill: parent
        fillMode: root.fill ? VideoOutput.Stretch : VideoOutput.PreserveAspectFit
        visible: root.source !== "" && player.hasVideo
    }

    // Teardown: pause + release the stream when the widget
    // leaves the screen (prevents the GStreamer GL context crash on re-init).
    // Stop (not just pause) so a re-shown item rebinds a fresh source
    // instead of resuming a failed decode loop.
    onVisibleChanged: {
        if (!visible)
            player.stop();
        else if (root.autoplay && root.source !== "")
            player.play();
    }
    Component.onDestruction: {
        player.stop()
        player.source = ""
    }
}
