pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io

// Mirrors the subset of the quickshell settings.json
// (~/.cache/quickshell/settings/settings.json) that the bar and panels
// consume. Values are read once at startup; the settings UI remains the
// editor and this shell follows the same file throughout.
Singleton {
    id: root

    // --- simple booleans / ints / strings ---
    property bool barLock: true
    property bool barSmartHide: false
    property bool barExpanded: false
    property bool barFullWidth: false
    property real revealPressure: 250
    property bool barOrientation: true        // true = top
    property bool workspaceNumbers: false

    // bar layout toggles (AGS: bar.layout = [{name:"workspaces",enabled:true}, ...])
    // barLayoutOrder preserves the drag-reorder sequence for persist().
    property var barLayout: ({ workspaces: true, information: true, utilities: true })
    property var barLayoutOrder: ["workspaces", "information", "utilities"]

    property string dateFormat: "%H:%M"
    readonly property var dateFormats: ["%H:%M", "%I:%M %p"]
    property real uiOpacity: 0.618
    property int uiScale: 10
    property int uiFontSize: 12

    property real leftPanelHotZoneSize: 5
    property real rightPanelHotZoneSize: 5
    property bool leftPanelHotZone: true
    property bool rightPanelHotZone: true
    property bool notifDnd: false
    property bool leftPanelLock: false
    property bool rightPanelLock: false
    property bool leftPanelExclusivity: true
    property bool rightPanelExclusivity: true
    property int leftPanelWidth: 400
    property int rightPanelWidth: 250
    // Selected left-panel tab (AGS leftPanel.widget.name, persisted)
    property string leftPanelWidget: "UserProfile"
    // Wallpaper switcher category (AGS wallpaperSwitcher.category, persisted)
    property string wallpaperCategory: "defaults/sfw"

    // Right panel widgets — mirrors AGS rightPanel.widgets (datalist with enabled flag)
    property var rightPanelWidgets: [
        { name: "Waifu",               icon: "\u{f004}", enabled: true },
        { name: "Media",               icon: "\u{f01d}", enabled: true },
        { name: "NotificationHistory", icon: "\u{f0f3}", enabled: true },
        { name: "ScriptTimer",         icon: "\u{f017}", enabled: false },
        { name: "Crypto",              icon: "\u{f15a}", enabled: false },
        { name: "Calendar",            icon: "\u{f073}", enabled: true },
        { name: "SystemResources",     icon: "\u{f080}", enabled: true },
    ]
    property bool autoWorkspaceSwitching: true

    // Bar-pinned crypto favorite (Information center), mirrors AGS crypto.favorite
    property var cryptoFavorite: ({ symbol: "", timeframe: "" })

    property var booru: ({
        api: ({ name: "Danbooru", value: "danbooru", url: "https://danbooru.donmai.us/", idSearchUrl: "https://danbooru.donmai.us/posts/" }),
        tags: ["-rating:explicit"],
        limit: 100,
        page: 1,
        columns: 3,
        bookmarks: [],
        pins: [],
        selectedTab: "Danbooru"
    })
    // Initialized with shipped defaults (not {}) so early fetchers (Booru
    // onCompleted) have credentials even before the settings file load
    // merges saved values over them. AGS deepMergeAuto behaves the same.
    property var apiKeys: ({
        openrouter: { user: { value: "" }, key: { value: "" } },
        danbooru: { user: { value: "publicapi" }, key: { value: "Pr5ddYN7P889AnM6nq2nhgw1" } },
        gelbooru: { user: { value: "1667355" }, key: { value: "1ccd9dd7c457c2317e79bd33f47a1138ef9545b9ba7471197f477534efd1dd05" } },
        safebooru: { user: { value: "publicapi" }, key: { value: "Pr5ddYN7P889AnM6nq2nhgw1" } }
    })

    // AGS default API credentials (settings.constants.ts apiKeys). Used as
    // fallback when the settings file has none saved — AGS deepMergeAuto
    // keeps these defaults in memory; QS must do the same or booru.py
    // hard-rejects danbooru/gelbooru with MISSING_CREDENTIALS.
    function defaultApiKeys() {
        return {
            openrouter: { user: { value: "" }, key: { value: "" } },
            danbooru: { user: { value: "publicapi" }, key: { value: "Pr5ddYN7P889AnM6nq2nhgw1" } },
            gelbooru: { user: { value: "1667355" }, key: { value: "1ccd9dd7c457c2317e79bd33f47a1138ef9545b9ba7471197f477534efd1dd05" } },
            safebooru: { user: { value: "publicapi" }, key: { value: "Pr5ddYN7P889AnM6nq2nhgw1" } }
        };
    }

    // Merge saved apiKeys over the defaults (per api, per field), accepting
    // both the AGS nested shape {user:{value}} and flat strings.
    function mergeApiKeys(saved) {
        const d = root.defaultApiKeys();
        if (!saved) return d;
        for (const api of Object.keys(d)) {
            const s = saved[api];
            if (s == null) continue;
            for (const field of ["user", "key"]) {
                const v = s[field];
                if (v == null) continue;
                const str = (typeof v === "object") ? (v.value ?? "") : String(v);
                if (str !== "") d[api][field] = { value: str };
            }
        }
        return d;
    }

    // Unwrap one credential as a plain string regardless of stored shape.
    function apiKey(api, field) {
        const v = (root.apiKeys || {})[api]?.[field];
        if (v == null) return "";
        return String((typeof v === "object" ? (v.value ?? "") : v)).replace(/\n/g, "").trim();
    }

    // Waifu widget (AGS: waifuWidget setting group)
    property var waifu: null

    // ChatBot provider + image-gen toggle (AGS settings.constants
    // chatBot: { api: chatBotApis[0], imageGeneration: false }).
    property string chatBotApi: "openai/gpt-4o-mini"
    property bool chatBotImageGeneration: false

    // Blur settings (AGS: bar.blur.size, bar.blur.passes, bar.blur.enabled)
    property bool barBlur: true
    property int barBlurPasses: 3
    property int barBlurSize: 4

    // Theme variants
    property bool dynamicThemeColors: true
    property bool dynamicThemeVariants: true

    // Always-on widget visibility
    property bool alwaysOnWidgetVisibility: true

    // KeyStrokeVisualizer settings
    property bool keyStrokeVisualizerVisibility: false
    property var keyStrokeVisualizerAnchor: ["bottom", "left"]

    // File manager (detected + selected)
    property var fileManagerOptions: []
    property string fileManager: ""

    // Profile picture
    property string profilePicturePath: ""

    // Hyprland settings (AGS settings.constants.ts hyprland schema, plain
    // values internally; persist() writes the AGS {name,value,min,max,type}
    // leaf shape so the shared settings.json stays AGS-compatible).
    property var hyprland: ({
        general: { border_size: 0, gaps_in: 7, gaps_out: 10 },
        decoration: {
            rounding: 16,
            active_opacity: 0.9,
            inactive_opacity: 0.8,
            blur: { enabled: true, size: 4, passes: 4, xray: false },
            shadow: { enabled: true, range: 15, render_power: 3 }
        }
    })

    // --- functions ---

    function fmt(d, f) {
        const p = (n) => n.toString().padStart(2, "0");
        if (f === "%I:%M %p") {
            let h = d.getHours() % 12; if (h === 0) h = 12;
            return `${p(h)}:${p(d.getMinutes())} ${d.getHours() < 12 ? "AM" : "PM"}`;
        }
        return `${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    // Update a setting by dotted path and persist to settings.json
    function updateSetting(path, value) {
        // AGS dotted paths that map to flat QS properties (Singleton cannot
        // gain new properties at runtime, so root["rightPanel"] = {} throws).
        const aliases = {
            "bar.lock": "barLock",
            "bar.smartHide": "barSmartHide",
            "bar.expanded": "barExpanded",
            "bar.fullWidth": "barFullWidth",
            "bar.revealPressure": "revealPressure",
            "bar.orientation": "barOrientation",
            "bar.workspaceNumbers": "workspaceNumbers",
            "bar.blur": "barBlur",
            "bar.blurSize": "barBlurSize",
            "bar.blurPasses": "barBlurPasses",
            "ui.opacity": "uiOpacity",
            "ui.scale": "uiScale",
            "ui.fontSize": "uiFontSize",
            "leftPanel.hotZoneSize": "leftPanelHotZoneSize",
            "rightPanel.hotZoneSize": "rightPanelHotZoneSize",
            "leftPanel.hotZone": "leftPanelHotZone",
            "rightPanel.hotZone": "rightPanelHotZone",
            "leftPanel.lock": "leftPanelLock",
            "rightPanel.lock": "rightPanelLock",
            "leftPanel.exclusivity": "leftPanelExclusivity",
            "rightPanel.exclusivity": "rightPanelExclusivity",
            "leftPanel.width": "leftPanelWidth",
            "leftPanel.widget": "leftPanelWidget",
            "wallpaperSwitcher.category": "wallpaperCategory",
            "rightPanel.width": "rightPanelWidth",
            "rightPanel.widgets": "rightPanelWidgets",
            "crypto.favorite": "cryptoFavorite",
            "notifications.dnd": "notifDnd",
            "autoWorkspaceSwitching": "autoWorkspaceSwitching",
            "dynamicThemeColors": "dynamicThemeColors",
            "dynamicThemeVariants": "dynamicThemeVariants",
            "alwaysOnWidget.visibility": "alwaysOnWidgetVisibility",
            "keyStrokeVisualizer.visibility": "keyStrokeVisualizerVisibility",
            "keyStrokeVisualizer.anchor": "keyStrokeVisualizerAnchor",
            "fileManager": "fileManager",
            "profilePicturePath": "profilePicturePath",
            "chatBot.api": "chatBotApi",
            "chatBot.imageGeneration": "chatBotImageGeneration",
            "waifuWidget.current": "waifu"
        };
        if (aliases[path] !== undefined) {
            root[aliases[path]] = value;
            persist();
            return;
        }
        const parts = path.split(".");
        let obj = root;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (obj[p] === undefined || typeof obj[p] !== "object" || obj[p] === null) {
                return;
            } else {
                obj = obj[p];
            }
        }
        const key = parts[parts.length - 1];
        obj[key] = value;
        // Reassign a FRESH clone so the top-level var change signal fires.
        // (Assigning the same object reference back is a no-op: nested
        // bindings like `Settings.booru.limit` never re-evaluate.)
        if (parts.length > 1) {
            root[parts[0]] = Object.assign({}, obj);
        }
        persist();
    }

    // Persist current settings back to the JSON file.
    // Shape is nested (bar.lock, leftPanel.width, ...) exactly like AGS
    // setGlobalSetting/writeJSONFile produce — reload() reads the same
    // shape, and AGS deepMergeAuto keeps unknown/missing keys safe.
    // Leaf settings AGS models as {name,value,...} are written as {value};
    // plain-value settings (locks, widths, dnd, fileManager) stay plain.
    function persist() {
        if (!root.ready) return;
        try {
            const s = {
                bar: {
                    lock: { value: root.barLock },
                    smartHide: { value: root.barSmartHide },
                    expanded: { value: root.barExpanded },
                    fullWidth: { value: root.barFullWidth },
                    revealPressure: { value: root.revealPressure },
                    orientation: { value: root.barOrientation },
                    workspaceNumbers: { value: root.workspaceNumbers },
                    layout: (root.barLayoutOrder || ["workspaces", "information", "utilities"]).map(n => (
                        { name: n, enabled: (root.barLayout || {})[n] ?? true }
                    )),
                    blur: { value: root.barBlur },
                    blurSize: { value: root.barBlurSize },
                    blurPasses: { value: root.barBlurPasses }
                },
                dateFormat: root.dateFormat,
                crypto: { favorite: root.cryptoFavorite },
                ui: {
                    opacity: { value: root.uiOpacity },
                    scale: { value: root.uiScale },
                    fontSize: { value: root.uiFontSize }
                },
                leftPanel: {
                    hotZoneSize: { value: root.leftPanelHotZoneSize },
                    hotZone: { value: root.leftPanelHotZone },
                    lock: root.leftPanelLock,
                    exclusivity: root.leftPanelExclusivity,
                    width: root.leftPanelWidth,
                    widget: { name: root.leftPanelWidget }
                },
                rightPanel: {
                    hotZoneSize: { value: root.rightPanelHotZoneSize },
                    hotZone: { value: root.rightPanelHotZone },
                    lock: root.rightPanelLock,
                    exclusivity: root.rightPanelExclusivity,
                    width: root.rightPanelWidth,
                    widgets: root.rightPanelWidgets
                },
                notifications: { dnd: root.notifDnd },
                wallpaperSwitcher: { category: root.wallpaperCategory },
                autoWorkspaceSwitching: { value: root.autoWorkspaceSwitching },
                // AGS leaf shape {name,value,min,max,type} — shared file must
                // stay readable by AGS createHyprlandSettings (plain numbers
                // would be mistaken for nested groups and render nothing).
                "hyprland": {
                    general: {
                        border_size: { name: "Border Size", value: root.hyprland?.general?.border_size ?? 0, min: 0, max: 10, type: "int" },
                        gaps_in: { name: "Gaps In", value: root.hyprland?.general?.gaps_in ?? 7, min: 0, max: 20, type: "int" },
                        gaps_out: { name: "Gaps Out", value: root.hyprland?.general?.gaps_out ?? 10, min: 0, max: 40, type: "int" }
                    },
                    decoration: {
                        rounding: { name: "Rounding", value: root.hyprland?.decoration?.rounding ?? 16, min: 0, max: 50, type: "int" },
                        active_opacity: { name: "Active Opacity", value: root.hyprland?.decoration?.active_opacity ?? 0.9, min: 0, max: 1, type: "float" },
                        inactive_opacity: { name: "Inactive Opacity", value: root.hyprland?.decoration?.inactive_opacity ?? 0.8, min: 0, max: 1, type: "float" },
                        blur: {
                            enabled: { name: "Blur Enabled", value: root.hyprland?.decoration?.blur?.enabled ?? true, type: "bool", min: 0, max: 1 },
                            size: { name: "Blur Size", value: root.hyprland?.decoration?.blur?.size ?? 4, type: "int", min: 0, max: 10 },
                            passes: { name: "Blur Passes", value: root.hyprland?.decoration?.blur?.passes ?? 4, type: "int", min: 0, max: 10 },
                            xray: { name: "Blur Xray", value: root.hyprland?.decoration?.blur?.xray ?? false, type: "bool", min: 0, max: 1 }
                        },
                        shadow: {
                            enabled: { name: "Shadow Enabled", value: root.hyprland?.decoration?.shadow?.enabled ?? true, type: "bool", min: 0, max: 1 },
                            range: { name: "Shadow Range", value: root.hyprland?.decoration?.shadow?.range ?? 15, type: "int", min: 0, max: 20 },
                            render_power: { name: "Shadow Render Power", value: root.hyprland?.decoration?.shadow?.render_power ?? 3, type: "int", min: 0, max: 20 }
                        }
                    }
                },
                dynamicThemeColors: { value: root.dynamicThemeColors },
                dynamicThemeVariants: { value: root.dynamicThemeVariants },
                alwaysOnWidget: { "visibility": { value: root.alwaysOnWidgetVisibility } },
                keyStrokeVisualizer: { "visibility": { value: root.keyStrokeVisualizerVisibility }, "anchor": { value: root.keyStrokeVisualizerAnchor } },
                fileManager: root.fileManager,
                profilePicturePath: root.profilePicturePath,
                "waifuWidget": {
                    current: root.waifu
                },
                "chatBot": {
                    api: root.chatBotApi,
                    imageGeneration: root.chatBotImageGeneration
                },
                "booru": {
                    api: root.booru.api,
                    tags: root.booru.tags,
                    limit: root.booru.limit,
                    page: root.booru.page,
                    columns: root.booru.columns,
                    bookmarks: root.booru.bookmarks,
                    pins: root.booru.pins,
                    selectedTab: root.booru.selectedTab ?? root.booru.api?.name ?? "Danbooru"
                },
                "apiKeys": root.apiKeys
            };
            _lastText = JSON.stringify(s, null, 2);
            _file.setText(_lastText);
        } catch (e) {
            console.warn("[Settings] Failed to persist:", e);
        }
    }

    // FileView for settings. NOTE: bare reload() here would resolve to
    // FileView.reload() (re-read method), NOT the settings parser below —
    // always qualify with root. (This shadowing was why settings silently
    // stopped applying after a restart.)
    property FileView _file: FileView {
        path: `${Quickshell.env("HOME")}/.cache/quickshell/settings/settings.json`
        watchChanges: true
        // Delayed: FileView saves are async, so an immediate re-read can
        // catch pre-write bytes and persist the stale state back over the
        // fresh one (seen: limit 30 reverted to 40 in-file). 300ms lets our
        // own write land; _lastText then makes it a no-op.
        onFileChanged: _reloadTimer.restart()
        onLoaded: { root.reload(); root.ready = true; }
    }
    // Last text we wrote (or successfully adopted): reload() skips it so
    // our own watcher echo can't churn assignments back over newer state.
    property string _lastText: ""
    property Timer _reloadTimer: Timer {
        interval: 300
        onTriggered: root.reload()
    }
    // Gate: FileView loads async, so any persist() before the first load
    // would write in-memory defaults over the user's saved file (seen:
    // booru.limit 20 clobbered back to 100 on restart). Nothing persists
    // until the on-disk values have been adopted.
    property bool ready: false

    // AGS readLocalSettings (settings-sync.ts): fresh on-disk settings for
    // upload sync — never an empty stub (uploading {} would wipe remote).
    function readLocalSettingsJson() {
        try {
            const text = _file.text();
            if (text && text.trim().startsWith("{")) return JSON.parse(text);
        } catch (e) {}
        return {};
    }

    function reload() {
        try {
            const text = _file.text()
            if (text !== "" && text.trim().startsWith("{")) {
                if (text === root._lastText) return;
                const s = JSON.parse(text)
                root._lastText = text;
                root.barLock = s.bar?.lock?.value ?? true
                root.barSmartHide = s.bar?.smartHide?.value ?? false
                root.barExpanded = s.bar?.expanded?.value ?? false
                root.barFullWidth = s.bar?.fullWidth?.value ?? false
                root.revealPressure = s.bar?.revealPressure?.value ?? 250
                root.barOrientation = s.bar?.orientation?.value ?? true
                root.workspaceNumbers = s.bar?.workspaceNumbers?.value ?? false

                // bar layout
                const layout = {};
                if (Array.isArray(s.bar?.layout)) {
                    for (const w of s.bar.layout) {
                        layout[w.name] = !!w.enabled;
                    }
                }
                root.barLayout = { workspaces: layout.workspaces ?? true, information: layout.information ?? true, utilities: layout.utilities ?? true };
                // Preserve the file's widget order (drag-reorder sequence);
                // fall back to the default order on unknown entries.
                if (Array.isArray(s.bar?.layout) && s.bar.layout.length > 0) {
                    const known = ["workspaces", "information", "utilities"]
                    const ordered = s.bar.layout.map(w => w.name).filter(n => known.includes(n))
                    for (const n of known) if (!ordered.includes(n)) ordered.push(n)
                    root.barLayoutOrder = ordered
                }

                root.dateFormat = s.dateFormat ?? "%H:%M"
                root.cryptoFavorite = s.crypto?.favorite ?? { symbol: "", timeframe: "" }
                root.uiOpacity = s.ui?.opacity?.value ?? 0.618
                root.uiScale = s.ui?.scale?.value ?? 10
                root.uiFontSize = s.ui?.fontSize?.value ?? 12

                root.leftPanelHotZoneSize = s.leftPanel?.hotZoneSize?.value ?? 5
                root.rightPanelHotZoneSize = s.rightPanel?.hotZoneSize?.value ?? 5
                root.leftPanelHotZone = s.leftPanel?.hotZone?.value ?? true
                root.rightPanelHotZone = s.rightPanel?.hotZone?.value ?? true
                root.notifDnd = s.notifications?.dnd ?? false
                root.leftPanelLock = !!s.leftPanel?.lock
                root.rightPanelLock = !!s.rightPanel?.lock
                root.leftPanelExclusivity = s.leftPanel?.exclusivity ?? true
                root.rightPanelExclusivity = s.rightPanel?.exclusivity ?? true
                root.leftPanelWidth = (typeof s.leftPanel?.width === "object" && s.leftPanel?.width !== null ? s.leftPanel.width.value : s.leftPanel?.width) ?? 400
                // AGS stores the selector object {name, icon}; QS writes {name};
                // legacy QS files used the flat "leftPanel.widget" key.
                const _lpw = s["leftPanel.widget"] ?? s.leftPanel?.widget
                root.leftPanelWidget = (typeof _lpw === "string" ? _lpw : _lpw?.name) ?? "UserProfile"
                root.wallpaperCategory = s.wallpaperSwitcher?.category ?? "defaults/sfw"
                root.rightPanelWidth = (typeof s.rightPanel?.width === "object" && s.rightPanel?.width !== null ? s.rightPanel.width.value : s.rightPanel?.width) ?? 250
                root.rightPanelWidgets = s.rightPanel?.widgets ?? root.rightPanelWidgets
                root.autoWorkspaceSwitching = s.autoWorkspaceSwitching?.value ?? true

                // AGS ensureRatingTagFirst parity: rating tag leads, defaulting
                // to -rating:explicit. Done here (not viewer boot) so the
                // file's tags are normalized the moment they are adopted —
                // viewer boot may run before or after this either way.
                let _tags = (s.booru?.tags ?? ["-rating:explicit"]).slice();
                const _rt = _tags.find(t => t.match(/[-]rating:explicit|rating:explicit/));
                _tags = _tags.filter(t => !t.match(/[-]rating:explicit|rating:explicit/));
                _tags.unshift(_rt ?? "-rating:explicit");
                root.booru = {
                    api: s.booru?.api ?? { name: "Danbooru", value: "danbooru", url: "https://danbooru.donmai.us/", idSearchUrl: "https://danbooru.donmai.us/posts/" },
                    tags: _tags,
                    limit: s.booru?.limit ?? 100,
                    page: s.booru?.page ?? 1,
                    columns: s.booru?.columns ?? 3,
                    bookmarks: s.booru?.bookmarks ?? [],
                    pins: s.booru?.pins ?? [],
                    selectedTab: s.booru?.selectedTab ?? s.booru?.api?.name ?? "Danbooru"
                }
                root.apiKeys = root.mergeApiKeys(s.apiKeys)

                // Waifu widget
                root.waifu = s.waifuWidget?.current ?? null

                // ChatBot provider (AGS restores globalSettings chatBot.api
                // on launch; stored as the model value string here).
                const cbApi = s.chatBot?.api;
                root.chatBotApi = (cbApi && typeof cbApi === "object" ? cbApi.value : cbApi) ?? "openai/gpt-4o-mini";
                root.chatBotImageGeneration = s.chatBot?.imageGeneration ?? false;

                // Blur settings
                root.barBlur = s.bar?.blur?.value ?? true
                root.barBlurPasses = s.bar?.blurPasses?.value ?? 3
                root.barBlurSize = s.bar?.blurSize?.value ?? 4

                const _dtc = s.dynamicThemeColors;
                root.dynamicThemeColors = (typeof _dtc === "object" && _dtc !== null ? _dtc.value : _dtc) ?? true
                const _dtv = s.dynamicThemeVariants;
                root.dynamicThemeVariants = (typeof _dtv === "object" && _dtv !== null ? _dtv.value : _dtv) ?? true

                // Always-on widget visibility
                root.alwaysOnWidgetVisibility = s.alwaysOnWidget?.visibility?.value ?? true

                // KeyStrokeVisualizer (anchor: legacy plain array or {value} leaf)
                root.keyStrokeVisualizerVisibility = s.keyStrokeVisualizer?.visibility?.value ?? false
                const _ka = s.keyStrokeVisualizer?.anchor
                root.keyStrokeVisualizerAnchor = (Array.isArray(_ka) ? _ka : _ka?.value) ?? ["bottom", "left"]

                // File manager
                root.fileManager = s.fileManager ?? ""

                // Profile picture path
                root.profilePicturePath = s.profilePicturePath ?? ""

                // Hyprland settings (full AGS schema incl. blur passes 4,
                // xray, gaps, opacities — previously partial, which reset
                // missing keys to 0/false on every reload)
                root.hyprland = {
                    general: {
                        border_size: s.hyprland?.general?.border_size?.value ?? 0,
                        gaps_in: s.hyprland?.general?.gaps_in?.value ?? 7,
                        gaps_out: s.hyprland?.general?.gaps_out?.value ?? 10
                    },
                    decoration: {
                        rounding: s.hyprland?.decoration?.rounding?.value ?? 16,
                        active_opacity: s.hyprland?.decoration?.active_opacity?.value ?? 0.9,
                        inactive_opacity: s.hyprland?.decoration?.inactive_opacity?.value ?? 0.8,
                        blur: {
                            enabled: s.hyprland?.decoration?.blur?.enabled?.value ?? true,
                            size: s.hyprland?.decoration?.blur?.size?.value ?? 4,
                            passes: s.hyprland?.decoration?.blur?.passes?.value ?? 4,
                            xray: s.hyprland?.decoration?.blur?.xray?.value ?? false
                        },
                        shadow: {
                            enabled: s.hyprland?.decoration?.shadow?.enabled?.value ?? true,
                            range: s.hyprland?.decoration?.shadow?.range?.value ?? 15,
                            render_power: s.hyprland?.decoration?.shadow?.render_power?.value ?? 3
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("[Settings] parse failed:", e)
        }
    }

    Component.onCompleted: {
        root.reload()
    }

    // Auto-persist: debounce writes so the settings file isn't thrashed
    // by rapid UI toggles (e.g. dragging the opacity slider).
    property Timer _persistTimer: Timer {
        interval: 250
        onTriggered: persist()
    }
    function schedulePersist() { if (root.ready) _persistTimer.start() }

    // Watch key settings properties for changes and auto-persist
    Connections {
        target: root
        function onBarLockChanged() { root.schedulePersist() }
        function onBarSmartHideChanged() { root.schedulePersist() }
        function onBarExpandedChanged() { root.schedulePersist() }
        function onBarFullWidthChanged() { root.schedulePersist() }
        function onRevealPressureChanged() { root.schedulePersist() }
        function onBarOrientationChanged() { root.schedulePersist() }
        function onWorkspaceNumbersChanged() { root.schedulePersist() }
        function onBarLayoutOrderChanged() { root.schedulePersist() }
        function onDateFormatChanged() { root.schedulePersist() }
        function onUiOpacityChanged() { root.schedulePersist() }
        function onUiScaleChanged() { root.schedulePersist() }
        function onUiFontSizeChanged() { root.schedulePersist() }
        function onLeftPanelHotZoneSizeChanged() { root.schedulePersist() }
        function onRightPanelHotZoneSizeChanged() { root.schedulePersist() }
        function onLeftPanelHotZoneChanged() { root.schedulePersist() }
        function onRightPanelHotZoneChanged() { root.schedulePersist() }
        function onNotifDndChanged() { root.schedulePersist() }
        function onLeftPanelLockChanged() { root.schedulePersist() }
        function onRightPanelLockChanged() { root.schedulePersist() }
        function onLeftPanelWidthChanged() { root.schedulePersist() }
        function onLeftPanelWidgetChanged() { root.schedulePersist() }
        function onWallpaperCategoryChanged() { root.schedulePersist() }
        function onRightPanelWidthChanged() { root.schedulePersist() }
        function onAutoWorkspaceSwitchingChanged() { root.schedulePersist() }
        function onHyprlandChanged() { root.schedulePersist() }
        function onBarBlurChanged() { root.schedulePersist() }
        function onBarBlurPassesChanged() { root.schedulePersist() }
        function onBarBlurSizeChanged() { root.schedulePersist() }
        function onDynamicThemeColorsChanged() { root.schedulePersist() }
        function onDynamicThemeVariantsChanged() { root.schedulePersist() }
        function onProfilePicturePathChanged() { root.schedulePersist() }
        function onWaifuChanged() { root.schedulePersist() }
        function onBooruChanged() { root.schedulePersist() }
        function onChatBotApiChanged() { root.schedulePersist() }
        function onChatBotImageGenerationChanged() { root.schedulePersist() }
        function onAlwaysOnWidgetVisibilityChanged() { root.schedulePersist() }
        function onKeyStrokeVisualizerVisibilityChanged() { root.schedulePersist() }
        function onKeyStrokeVisualizerAnchorChanged() { root.schedulePersist() }
        function onFileManagerChanged() { root.schedulePersist() }
    }
}