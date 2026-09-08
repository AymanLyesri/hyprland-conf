import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Io
import qs.theme
import qs.widgets.shared
import qs.services
import qs.widgets.media

// Waifu widget ported from widgets/rightPanel/components/Waifu.tsx
// Shows the current waifu image or a placeholder with a link to open
// the BooruViewer in the left panel.
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""

    readonly property string booruPath: `${Quickshell.env("HOME")}/.cache/quickshell/booru`
    readonly property string booruScript: `${Quickshell.env("HOME")}/.config/quickshell/archeclipse/scripts/booru.py`

    // Current waifu data from Settings — mirrors globalSettings.waifuWidget.current
    readonly property var waifuDataObj: Settings.waifu || null

    // Safe accessors (return null/empty when no waifu)
    readonly property var wd: root.waifuDataObj
    readonly property int wd_id: root.wd ? (root.wd.id || 0) : 0
    readonly property string wd_apiValue: root.wd && root.wd.api ? root.wd.api.value : "danbooru"
    readonly property string wd_extension: root.wd ? (root.wd.extension || "") : ""
    readonly property var wd_tags: root.wd ? (root.wd.tags || []) : []
    readonly property int wd_width: root.wd ? (root.wd.width || 0) : 0
    readonly property int wd_height: root.wd ? (root.wd.height || 0) : 0

    // AGS WaifuDisplay shows the widget for any truthy id (custom uploads
    // use id -1) — only a missing/empty id means "no image selected".
    readonly property bool hasWaifu: !!(root.wd && root.wd.id)
    readonly property string imagePath: root.hasWaifu ? `${root.booruPath}/${root.wd_apiValue}/images/${root.wd_id}.${root.wd_extension || "jpg"}` : ""
    readonly property string previewPath: root.hasWaifu ? `${root.booruPath}/${root.wd_apiValue}/previews/${root.wd_id}.${root.wd_extension || "jpg"}` : ""
    readonly property bool isVideo: ["mp4", "webm", "mkv", "gif", "zip"].includes(root.wd_extension.toLowerCase())

    // Dynamic height from aspect ratio: metadata first, loaded image intrinsic as fallback
    readonly property real aspectRatio: {
        if (root.wd_width > 0 && root.wd_height > 0)
            return root.wd_width / root.wd_height;
        if (imageDisplay.implicitImageWidth > 0 && imageDisplay.implicitImageHeight > 0)
            return imageDisplay.implicitImageWidth / imageDisplay.implicitImageHeight;
        return 1.0;
    }
    readonly property real mediaHeight: {
        if (!root.hasWaifu)
            return 0;
        // Widget owns its padding: 8px per side.
        var w = root.widgetWidth - 16;
        if (w <= 0)
            w = root.widgetWidth;
        var h = w / root.aspectRatio;
        return Math.min(Math.max(h, 120), 520);
    }

    // Loading state for fetch-by-ID and ensure-download below.
    property string loadingState: "idle"   // "loading" | "error" | "success" | "idle"
    property int selectedApiIndex: 0

    // AGS BooruImage.ensureFilesExist("both"): a viewer-set waifu whose full
    // image / preview was never downloaded renders blank, so fetch what's
    // missing (Referer headers: Qt gets 403 without them, same as the
    // viewer's downloadPreviews/fetchOriginal). Files already on disk skip
    // the download and just re-point the sources.
    function ensureWaifuFiles() {
        refreshSources();
        if (!root.hasWaifu)
            return;
        const wd = root.wd;
        const api = (wd.api && wd.api.value) || "danbooru";
        const referer = (wd.api && wd.api.url) || "";
        const ext = wd.extension || "jpg";
        const jobs = [];
        if (wd.url && /^https?:\/\//.test(wd.url))
            jobs.push({
                path: `${root.booruPath}/${api}/images/${wd.id}.${ext}`,
                url: wd.url
            });
        if (wd.preview && /^https?:\/\//.test(wd.preview))
            jobs.push({
                path: `${root.booruPath}/${api}/previews/${wd.id}.${ext}`,
                url: wd.preview
            });
        if (jobs.length === 0)
            return;
        root.loadingState = "loading";
        let pending = jobs.length;
        let ok = false;
        function finish(success) {
            if (success)
                ok = true;
            if (--pending === 0) {
                root.loadingState = ok ? "success" : "error";
                refreshSources();
            }
        }
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const check = Qt.createQmlObject('import Quickshell.Io; Process { stdout: StdioCollector {} }', root);
            check.command = ["bash", "-c", "test -s " + JSON.stringify(job.path) + " && echo yes || echo no"];
            check.stdout.onStreamFinished.connect(function () {
                if (check.stdout.text.trim() === "yes") {
                    finish(true);
                } else {
                    const dl = Qt.createQmlObject('import Quickshell.Io; Process {}', root);
                    dl.command = ["bash", "-c", `mkdir -p ${JSON.stringify(job.path.substring(0, job.path.lastIndexOf("/")))} && curl -sSfL -H "User-Agent: QuickshellBooru/1.0 (ArchLinux; Hyprland)"` + (referer !== "" ? ` -H "Referer: ${referer}"` : "") + ` -o ${JSON.stringify(job.path)} ${JSON.stringify(job.url)}`];
                    dl.exited.connect(function (code) {
                        finish(code === 0);
                        dl.destroy();
                    });
                    dl.running = true;
                }
                check.destroy();
            });
            check.running = true;
        }
    }

    // Local cache paths for a waifu object. Computed from root.wd directly:
    // sibling derived bindings (imagePath/previewPath) are still settling
    // while onWdChanged/onImagePathChanged handlers run, so reading them
    // here yields stale intermediate values.
    function waifuPaths() {
        const wd = root.wd;
        if (!(wd && wd.id))
            return {
                img: "",
                prev: ""
            };
        const api = (wd.api && wd.api.value) || "danbooru";
        const ext = wd.extension || "jpg";
        return {
            img: `${root.booruPath}/${api}/images/${wd.id}.${ext}`,
            prev: `${root.booruPath}/${api}/previews/${wd.id}.${ext}`
        };
    }

    // (Re)point the media sources at the current waifu. Bounces through ""
    // so a file that landed after a failed load retries instead of staying
    // blank — QML media never reloads on its own.
    function refreshSources() {
        const p = root.waifuPaths();
        imageDisplay.fallbackSource = p.prev;
        if (imageDisplay.source !== p.img) {
            imageDisplay.source = p.img;
        } else if (p.img !== "") {
            imageDisplay.source = "";
            imageDisplay.source = p.img;
        }
        if (mediaVideo.source !== p.img) {
            mediaVideo.source = p.img;
        } else if (p.img !== "") {
            mediaVideo.source = "";
            mediaVideo.source = p.img;
        }
    }

    onWdChanged: {
        // Skip the construction-time evaluation: the media items below
        // don't exist yet (Component.onCompleted runs the first ensure).
        if (!root._ready)
            return;
        root.loadingState = "idle";
        root.ensureWaifuFiles();
    }

    // Refresh off the path notification too: bindings into the media items
    // below don't reliably propagate these updates on their own.
    onImagePathChanged: refreshSources()
    property bool _ready: false
    Component.onCompleted: {
        root._ready = true;
        root.ensureWaifuFiles();
    }

    readonly property var booruApis: [
        {
            name: "Danbooru",
            value: "danbooru",
            url: "https://danbooru.donmai.us/",
            idSearchUrl: "https://danbooru.donmai.us/posts/"
        },
        {
            name: "Gelbooru",
            value: "gelbooru",
            url: "https://gelbooru.com/",
            idSearchUrl: "https://gelbooru.com/index.php?page=post&s=view&id="
        },
        {
            name: "Safebooru",
            value: "safebooru",
            url: "https://safebooru.donmai.us/",
            idSearchUrl: "https://safebooru.donmai.us/posts/"
        },
    ]

    // Upload a custom local image as the current waifu (AGS upload button:
    // zenity file-selection → identify dims → copy to custom/images/-1.<ext>).
    function uploadCustomImage() {
        const pick = Qt.createQmlObject('import Quickshell.Io; Process { command: ["zenity", "--file-selection", "--title=Select Image", "--file-filter=Images (png, jpg, webp, gif) | *.png *.jpg *.jpeg *.webp *.gif"] }', root);
        pick.running = true;
        pick.stdout = Qt.createQmlObject('import Quickshell.Io; StdioCollector {}', root);
        pick.finished.connect(function (code) {
            const path = pick.stdout.text.trim();
            if (!path) {
                pick.destroy();
                return;
            }
            const ext = (path.split(".").pop() || "png").toLowerCase();
            // identify dims
            const idProc = Qt.createQmlObject('import Quickshell.Io; Process { command: ["identify", "-format", "%h %w", "' + path.replace(/'/g, "'\\''") + '"] }', root);
            idProc.running = true;
            idProc.stdout = Qt.createQmlObject('import Quickshell.Io; StdioCollector {}', root);
            idProc.finished.connect(function () {
                const dims = idProc.stdout.text.trim().split(" ").map(Number);
                const h = dims[0] || 0, w = dims[1] || 0;
                // mkdir + copy
                const dest = `${root.booruPath}/custom/images/-1.${ext}`;
                const cp = Qt.createQmlObject('import Quickshell.Io; Process { running: false }', root);
                cp.command = ["bash", "-c", `mkdir -p '${root.booruPath}/custom/images' && cp -- '${path}' '${dest}'`];
                cp.finished.connect(function () {
                    const newWaifu = {
                        id: -1,
                        width: w,
                        height: h,
                        api: {
                            name: "Custom",
                            value: "custom"
                        },
                        extension: ext,
                        tags: ["custom"],
                        url: dest,
                        preview: dest
                    };
                    Settings.waifu = newWaifu;
                    Settings.persist();
                    Notifications.notify({
                        summary: "Waifu",
                        body: "Custom image set"
                    });
                    cp.destroy();
                    idProc.destroy();
                    pick.destroy();
                });
                cp.running = true;
            });
            idProc.running = true;
        });
        pick.running = true;
    }

    // ---- placeholder: no image selected ----
    Item {
        anchors.fill: parent
        visible: !root.hasWaifu

        Column {
            anchors.centerIn: parent
            spacing: 12

            Text {
                text: "No image selected"
                font.pixelSize: Theme.fontSize + 4
                font.bold: true
                color: Theme.fg
            }
            Text {
                text: "Open Booru Viewer to select an image"
                color: Theme.fgDim
                font.pixelSize: Theme.fontSize
            }
            AppButton {
                text: "Open Booru Viewer"
                onClicked: {
                    // AGS Waifu.tsx: show left-panel + set leftPanel.widget
                    // to BooruViewer. Registry.selectLeftTab does both
                    // (never toggles it off when already visible).
                    Registry.selectLeftTab("BooruViewer");
                }
            }
        }
    }

    // Hover state keeps the overlay open while the search field holds focus
    // (mouse may leave the image while typing an ID).
    property bool searchFocused: false

    // ---- media display with hover-reveal action overlay ----
    // The image fills the widget; the actions live in a floating sheet
    // anchored to the image bottom that slides upwards on hover.
    Item {
        id: mediaContainer
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.topMargin: 8
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        height: root.mediaHeight
        visible: root.hasWaifu
        clip: true

        // Revealed while hovering the image/overlay, or while typing an ID.
        readonly property bool overlayRevealed: hoverHandler.hovered || root.searchFocused

        HoverHandler {
            id: hoverHandler
        }

        AppImage {
            id: imageDisplay
            anchors.fill: parent
            // Source owned by refreshSources() (re-points after the
            // ensure-download lands). Preview fallback while missing.
            source: root.imagePath
            fallbackSource: root.previewPath
            sourceWidth: parent.width
            visible: !root.isVideo
        }

        // Video fallback — playable via QtMultimedia (AGS Video.tsx Gtk.Video)
        MediaVideo {
            id: mediaVideo
            anchors.fill: parent
            anchors.margins: 4
            source: root.imagePath
            autoplay: true
            loop: true
            fill: true
            visible: root.isVideo && root.wd_extension.toLowerCase() !== "zip"
        }

        // Zip/ugoira placeholder (AGS MediaDisplay isZip branch)
        Column {
            anchors.centerIn: parent
            spacing: 8
            visible: root.wd_extension.toLowerCase() === "zip"
            Text {
                text: "\u{F13C6}"
                color: Theme.fgDim
                font.pixelSize: 40
                anchors.horizontalCenter: parent.horizontalCenter
            }
            Text {
                text: "This type of video file cannot be played."
                color: Theme.fgDim
                font.pixelSize: Theme.fontSize
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.Wrap
            }
            Text {
                text: "Open in browser to view media."
                color: Theme.fgDim
                font.pixelSize: Theme.fontSize - 2
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.Wrap
            }
        }

        // Progress indicator (AGS Progress bound to _loadingState)
        Rectangle {
            id: progressBadge
            z: 3
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.margins: 6
            width: 64
            height: 20
            radius: 4
            color: root.loadingState === "error" ? Theme.danger : (root.loadingState === "success" ? Theme.surfaceActive : Theme.bg)
            border.color: root.loadingState === "error" ? Theme.danger : Theme.border
            visible: root.loadingState !== "idle"
            Text {
                anchors.centerIn: parent
                text: root.loadingState === "loading" ? "Loading..." : (root.loadingState === "error" ? "Error" : "Ready")
                color: root.loadingState === "loading" ? Theme.fgDim : (root.loadingState === "error" ? "#fff" : Theme.accent)
                font.pixelSize: 11
            }
        }

        // Peek handle — affordance hint shown while the overlay is hidden.
        Rectangle {
            z: 1
            anchors.bottom: parent.bottom
            anchors.bottomMargin: 8
            anchors.horizontalCenter: parent.horizontalCenter
            width: 40
            height: 5
            radius: 3
            color: Theme.fg
            opacity: mediaContainer.overlayRevealed ? 0 : 0.65
            visible: opacity > 0
            Behavior on opacity {
                NumberAnimation {
                    duration: 180
                }
            }
        }

        // ---- action overlay sheet: slides upwards from the image bottom ----
        Rectangle {
            id: actionsOverlay
            z: 2
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.leftMargin: 8
            anchors.rightMargin: 8
            // Hidden state parks the sheet below the image edge; the clip
            // on mediaContainer keeps it out of sight during the slide.
            anchors.bottomMargin: mediaContainer.overlayRevealed ? 8 : -(height + 16)
            Behavior on anchors.bottomMargin {
                NumberAnimation {
                    duration: 280
                    easing.type: Easing.OutCubic
                }
            }
            height: actionsCol.height + 20
            radius: Theme.radius
            color: Theme.surfaceHover
            border.color: Theme.border
            border.width: 1
            opacity: mediaContainer.overlayRevealed ? 1 : 0
            Behavior on opacity {
                NumberAnimation {
                    duration: 200
                }
            }
            // Ignore pointer input while hidden so image hovers/views pass through.
            enabled: mediaContainer.overlayRevealed

            Column {
                id: actionsCol
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.margins: 8
                spacing: 8

        // Section 1: bookmark + pin
        RowLayout {
            width: parent.width
            height: 28
            spacing: 8
            // Bookmark toggle
            AppButton {
                property bool bookmarked: (Settings.booru.bookmarks || []).some(b => b.id === root.wd_id && b.api?.value === root.wd_apiValue)
                text: root.bookmarked ? "\u{f004}" : "\u{f0160}"
                Layout.fillWidth: true
                Layout.preferredHeight: 28
                tooltipText: "Bookmark"
                onClicked: {
                    const bookmarks = Settings.booru.bookmarks || [];
                    const idx = bookmarks.findIndex(b => b.id === root.wd_id && b.api?.value === root.wd_apiValue);
                    if (idx >= 0) {
                        const next = bookmarks.slice();
                        next.splice(idx, 1);
                        Settings.booru.bookmarks = next;
                    } else {
                        Settings.booru.bookmarks = [...bookmarks, root.wd];
                    }
                    Settings.persist();
                }
            }

            // Pin to terminal
            AppButton {
                property bool pinned: (Settings.booru.pins || []).some(p => p.id === root.wd_id && p.api?.value === root.wd_apiValue)
                text: pinned ? "\u{f44c}" : "\u{f98b}"
                Layout.fillWidth: true
                Layout.preferredHeight: 28
                tooltipText: root.isVideo ? "Cannot pin videos" : "Pin to terminal"
                enabled: !root.isVideo
                onClicked: {
                    const pins = Settings.booru.pins || [];
                    const existing = pins.findIndex(p => p.id === root.wd_id && p.api?.value === root.wd_apiValue);
                    if (existing >= 0) {
                        const next = pins.slice();
                        next.splice(existing, 1);
                        Settings.booru.pins = next;
                    } else {
                        Settings.booru.pins = [...pins, root.wd];
                    }
                    Settings.persist();
                }
            }
        }

        // Section 2: open in viewer + browser + copy
        RowLayout {
            width: parent.width
            height: 28
            spacing: 8

            // Open in viewer
            AppButton {
                text: "\u{f07c}"
                Layout.fillWidth: true
                Layout.preferredHeight: 28
                tooltipText: "Open in viewer"
                onClicked: Quickshell.execDetached(["xdg-open", root.imagePath])
            }

            // Open in browser
            AppButton {
                text: "\u{f08e}"
                Layout.fillWidth: true
                Layout.preferredHeight: 28
                tooltipText: "Open in browser"
                onClicked: {
                    const api = root.booruApis[root.selectedApiIndex];
                    Quickshell.execDetached(["xdg-open", api.idSearchUrl + root.wd_id]);
                }
            }

            // Copy to clipboard
            AppButton {
                text: "\u{f0c5}"
                Layout.fillWidth: true
                Layout.preferredHeight: 28
                tooltipText: "Copy to clipboard"
                enabled: !root.isVideo
                onClicked: Quickshell.execDetached(["bash", "-c", `wl-copy --type image/png < '${root.imagePath}'`])
            }
        }

        // Section 3: search by ID + entry + upload
        RowLayout {
            width: parent.width
            height: 28
            spacing: 8
            // Search by ID
            AppButton {
                text: "\u{f002}"
                Layout.preferredWidth: 36
                Layout.preferredHeight: 28
                tooltipText: "Search by post ID"
                onClicked: idSearchField.forceActiveFocus()
            }

        AppTextField {
            id: idSearchField
            Layout.fillWidth: true
            Layout.preferredHeight: 28
            placeholderText: "Post ID..."
            text: root.wd && root.wd.input_history ? root.wd.input_history : ""
            font.family: Theme.fontFamily
            onActiveFocusChanged: root.searchFocused = activeFocus
            onAccepted: {
                root.loadingState = "loading";
                const api = root.booruApis[root.selectedApiIndex];
                const proc = Qt.createQmlObject('import Quickshell.Io; Process { command: ["python", "' + root.booruScript + '", "--api", "' + api.value + '", "--id", "' + text + '"] }', root);
                proc.running = true;
                proc.stdout = Qt.createQmlObject('import Quickshell.Io; StdioCollector {}', root);
                proc.stdout.onStreamFinished.connect(function () {
                    const response = proc.stdout.text;
                    try {
                        if (response && response.trim() !== "" && response.trim().startsWith("[")) {
                            const parsed = JSON.parse(response);
                            if (parsed.length > 0) {
                                const img = parsed[0];
                                const newWaifu = {
                                    id: img.id,
                                    width: img.width,
                                    height: img.height,
                                    api: api,
                                    tags: img.tags || [],
                                    extension: img.extension,
                                    url: img.url,
                                    preview: img.preview,
                                    input_history: text   // persist last ID (AGS waifuWidget.input_history)
                                };
                                Settings.waifu = newWaifu;
                                Settings.persist();
                                root.loadingState = "success";
                            }
                        }
                    } catch (e) {
                        root.loadingState = "error";
                    }
                    proc.destroy();
                });
            }
        }

            // Upload custom image (AGS upload button: zenity select → identify dims
            // → copy to custom/images/-1.<ext> → set as current waifu)
            AppButton {
                text: "\u{f093}"
                Layout.preferredWidth: 40
                Layout.preferredHeight: 28
                tooltipText: "Upload custom image"
                onClicked: root.uploadCustomImage()
            }
        }


        // Section 4: API tabs
        RowLayout {
            width: parent.width
            height: 28
            spacing: 8
            Repeater {
                model: root.booruApis
                delegate: AppButton {
                    text: modelData.name
                    Layout.fillWidth: true
                    Layout.preferredHeight: 28
                    toggle: true
                    checked: root.selectedApiIndex === index
                    onClicked: root.selectedApiIndex = index
                    pixelSize: Theme.fontSize - 4
                }
            }
        }
            } // actionsCol
        } // actionsOverlay
    } // mediaContainer
}
