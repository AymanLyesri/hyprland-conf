import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Io
import qs.theme
import qs.widgets.shared
import qs.services

// User Profile widget - full port of UserProfile.tsx + Supabase.class.tsx
// Auth via magic link -> local Python callback server writes session.json ->
// profile fetched from Supabase REST. Settings sync upload/download to
// ~/.cache/quickshell/settings/settings.json (quickshell-local).
// minimal mode (for UserPanel overlay): shows only avatar + username
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""
    property bool minimal: false

    // --- Config (single source of truth mirroring supabase.constants.ts) ---
    readonly property string supabaseUrl: "https://skekmjmsgcbfhbwgpzkp.supabase.co"
    readonly property string supabaseKey: "sb_publishable_PLXFIwBsb79Gfu3YkW5B-w_rHozkZ1y"
    readonly property string homeDir: Quickshell.env("HOME")
    // auth-server-callback.py owns session.json under ~/.config/ags/cache/auth
    // (SESSION_PATH hardcoded in the script) — read the same file it writes,
    // or sign-in state silently forks between the shells.
    readonly property string authSessionPath: homeDir + "/.config/ags/cache/auth/session.json"
    readonly property string settingsPath: homeDir + "/.cache/quickshell/settings/settings.json"
    readonly property string settingsMetaPath: homeDir + "/.cache/quickshell/settings/settings-sync.json"
    readonly property string avatarPath: homeDir + "/.face.icon"
    // Cache-busting avatar source: same path strings don't refetch after
    // cp/curl rewrites ~/.face.icon, so toggle through "" to force reload.
    property string avatarSrc: homeDir + "/.face.icon"
    function reloadAvatar() {
        root.avatarSrc = "";
        Qt.callLater(() => {
            root.avatarSrc = root.avatarPath;
        });
    }

    // --- State ---
    property var profile: null
    property string progressStatus: "idle"
    property string progressText: "Not signed in"
    property bool isSyncing: false
    property bool isRefreshing: false
    property string lastSyncAt: "Never"
    property string lastSyncResult: "-"
    property string lastRemoteUpdatedAt: "Never"
    property var _cachedSession: null
    // Magic-link button confirmation (AGS flips the label on success)
    property string magicState: "Send Magic Link"

    // AGS UserProfile.tsx:113-125 — per-API bookmark counts from
    // globalSettings booru.bookmarks (each item stores api.value).
    readonly property var booruApis: [
        {
            name: "Danbooru",
            value: "danbooru"
        },
        {
            name: "Gelbooru",
            value: "gelbooru"
        },
        {
            name: "Safebooru",
            value: "safebooru"
        },
    ]
    readonly property var booruFavoriteCounts: {
        const counts = {
            danbooru: 0,
            gelbooru: 0,
            safebooru: 0
        };
        const marks = Settings.booru ? Settings.booru.bookmarks : null;
        if (marks)
            for (const b of marks) {
                const v = b && b.api ? b.api.value : null;
                if (v && typeof counts[v] === "number")
                    counts[v] += 1;
            }
        return counts;
    }
    // AGS UserProfile.tsx:44 — fastfetch pin count.
    readonly property int pinnedCount: {
        const pins = Settings.booru ? Settings.booru.pins : null;
        return pins ? pins.length : 0;
    }

    property QtObject fileWatch: QtObject {
        id: _fw
    }
    property int activeTab: 0

    // Change-gated polling: AGS uses monitorFile on the auth dir + meta
    // file (event-driven). QS polls the two LOCAL files and only refetches
    // the profile when session.json actually changed — no network on ticks.
    property string _lastSessionText: ""
    property int _netAttempts: 0

    Component.onCompleted: {
        applySettingsSyncMeta();
        _netTimer.restart();
    }

    // Network gate (AGS waitForNetwork up to 30s): check the Supabase
    // health endpoint, 3s apart, max 10 tries, then proceed regardless.
    property Timer _netTimer: Timer {
        interval: 3000
        repeat: false
        running: false
        onTriggered: {
            const p = netGateComp.createObject(root);
            p.command = ["curl", "-sS", "-o", "/dev/null", "--max-time", "5", root.supabaseUrl + "/auth/v1/health"];
            p.running = true;
        }
    }

    function onNetGateDone(ok) {
        if (ok || root._netAttempts >= 9) {
            root.loadProfile();
            pollTimer.restart();
            return;
        }
        root._netAttempts++;
        _netTimer.restart();
    }

    property Timer pollTimer: Timer {
        interval: 10000
        repeat: true
        running: false
        onTriggered: {
            const p = pollSessionComp.createObject(root);
            p.command = ["cat", root.authSessionPath];
            p.running = true;
            root.applySettingsSyncMeta();
        }
    }

    function onPollSession(text) {
        if (text !== root._lastSessionText) {
            root._lastSessionText = text;
            root.loadProfile();
        }
    }

    // ===== PROFILE =====
    function loadProfile() {
        const p = loadAuthComp.createObject(root);
        p.command = ["cat", root.authSessionPath];
        p.running = true;
    }

    function handleSessionJson(text) {
        root._lastSessionText = text || "";
        let session = null;
        try {
            session = text ? JSON.parse(text) : null;
        } catch (e) {
            session = null;
        }
        root._cachedSession = session;
        if (!session?.access_token) {
            root.profile = null;
            root.progressStatus = "idle";
            root.progressText = "Not signed in";
            root.isRefreshing = false;
            return;
        }
        root.progressStatus = "loading";
        root.progressText = "Loading profile...";
        const p = fetchProfileComp.createObject(root);
        p.command = ["bash", "-c", "curl -sS -H 'apikey: " + supabaseKey + "' -H 'Authorization: Bearer " + session.access_token + "' '" + supabaseUrl + "/auth/v1/user'; echo; echo '---SEP---'; curl -sS -H 'apikey: " + supabaseKey + "' -H 'Authorization: Bearer " + session.access_token + "' '" + supabaseUrl + "/rest/v1/user_profiles?select=id,username,avatar&id=eq." + (lookupUserId() ? encodeURIComponent(lookupUserId()) : "none") + "'"];
        p.running = true;
    }

    function lookupUserId() {
        return _cachedSession?.user?.id ?? _cachedSession?.id ?? "";
    }

    // ===== MAGIC LINK =====
    function sendMagicLink(email) {
        if (!email || email.trim() === "") {
            Notifications.notify({
                summary: "Email",
                body: "Enter a valid email"
            });
            return;
        }
        const p = magicLinkComp.createObject(root);
        p.command = ["bash", "-c", "curl -sS -X POST -H 'Content-Type: application/json' -H 'apikey: " + supabaseKey + "' -d '" + JSON.stringify({
                email: email.trim(),
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: "http://127.0.0.1:53100/callback"
                }
            }) + "' '" + supabaseUrl + "/auth/v1/otp'"];
        p.running = true;
        ensureAuthServer();
    }

    function ensureAuthServer() {
        const p = authServerComp.createObject(root);
        p.command = ["bash", "-c", "pkill -f 'python3 " + homeDir + "/.config/ags/scripts/auth-server-callback.py' || true"];
        p.running = true;
        p.onExited = function () {
            const p2 = authServerComp.createObject(root);
            p2.command = ["bash", "-c", "(python3 '" + homeDir + "/.config/ags/scripts/auth-server-callback.py' >/tmp/ags-auth-server.log 2>&1 &)"];
            p2.running = true;
        };
    }

    // ===== UPDATE PROFILE =====
    function updateProfile() {
        const session = _cachedSession;
        if (!session?.access_token) {
            Notifications.notify({
                summary: "Not signed in",
                body: "Please sign in to update profile."
            });
            return;
        }
        root.progressStatus = "loading";
        root.progressText = "Updating profile...";
        const uid = session.user?.id ?? session.id ?? "";
        const username = usernameField.text.trim() || homeDir.split("/").pop();
        const p = updateProfileComp.createObject(root);
        p.command = ["bash", "-c", "curl -sS -X PATCH -H 'Content-Type: application/json' -H 'apikey: " + supabaseKey + "' -H 'Authorization: Bearer " + session.access_token + "' -H 'Prefer: return=representation' -d '" + JSON.stringify({
                username
            }) + "' '" + supabaseUrl + "/rest/v1/user_profiles?id=eq." + encodeURIComponent(uid) + "'"];
        p.running = true;
    }

    // ===== LOGOUT =====
    function logout() {
        logoutComp.createObject(root).running = true;
        root.profile = null;
        root.progressStatus = "idle";
        root.progressText = "Signed out";
        Notifications.notify({
            summary: "Signed out",
            body: "Your session has been cleared."
        });
    }

    // ===== SETTINGS SYNC =====
    function applySettingsSyncMeta() {
        const p = readMetaComp.createObject(root);
        p.command = ["cat", root.settingsMetaPath];
        p.running = true;
    }

    function formatTs(iso) {
        if (!iso)
            return "Never";
        const d = new Date(iso);
        if (isNaN(d.getTime()))
            return "Never";
        const p = n => n.toString().padStart(2, "0");
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
    }

    function syncSettings(direction) {
        if (root.isSyncing)
            return;
        const session = _cachedSession;
        if (!session?.access_token) {
            Notifications.notify({
                summary: "Settings Sync",
                body: "Not signed in."
            });
            return;
        }
        root.isSyncing = true;
        root.progressStatus = "loading";
        root.progressText = direction === "upload" ? "Uploading settings..." : "Downloading settings...";
        const uid = session.user?.id ?? session.id ?? "";

        if (direction === "upload") {
            const settingsJson = readLocalSettings();
            const p = syncUploadComp.createObject(root);
            p.command = ["bash", "-c", "curl -sS -X POST -H 'Content-Type: application/json' -H 'apikey: " + supabaseKey + "' -H 'Authorization: Bearer " + session.access_token + "' -H 'Prefer: resolution=merge-duplicates,return=representation' -d '" + JSON.stringify({
                    id: uid,
                    settings: settingsJson,
                    updated_at: new Date().toISOString()
                }) + "' '" + supabaseUrl + "/rest/v1/user_settings?on_conflict=id'"];
            p.running = true;
        } else {
            const p = syncDownloadComp.createObject(root);
            p.command = ["bash", "-c", "curl -sS -H 'apikey: " + supabaseKey + "' -H 'Authorization: Bearer " + session.access_token + "' '" + supabaseUrl + "/rest/v1/user_settings?select=id,settings,updated_at&id=eq." + encodeURIComponent(uid) + "'"];
            p.running = true;
        }
    }

    // AGS readLocalSettings (utils/settings-sync.ts): the real on-disk
    // settings file — never {} (an empty upload would wipe the remote copy).
    function readLocalSettings() {
        return Settings.readLocalSettingsJson();
    }

    // ===== AVATAR (AGS UserProfile avatar button + setProfileAvatarFromPath) =====
    // State carried across the convert -> upload -> patch -> fetch chain.
    property string _avatarSrc: ""
    property string _avatarUid: ""
    property string _avatarUploadPath: ""
    property string _avatarContentType: ""
    property string _avatarExt: ""

    function chooseAvatar() {
        const p = zenityComp.createObject(root);
        p.command = ["zenity", "--file-selection", "--title=Select Profile Picture", "--file-filter=Images (png, jpg, webp) | *.png *.jpg *.jpeg *.webp"];
        p.running = true;
    }

    function onAvatarPicked(path) {
        const clean = (path || "").trim();
        if (!clean)
            return;
        const ext = (clean.split(".").pop() || "").toLowerCase();
        const ctype = ext === "png" ? "image/png" : (ext === "jpg" || ext === "jpeg") ? "image/jpeg" : ext === "webp" ? "image/webp" : null;
        if (!ctype) {
            Notifications.notify({
                summary: "Invalid image",
                body: "Pick a PNG, JPG, or WebP file."
            });
            return;
        }
        const session = root._cachedSession;
        const uid = session?.user?.id ?? session?.id ?? "";
        // Not signed in: local-only copy (AGS setProfileAvatarFromPath path).
        if (!session?.access_token || !uid) {
            root.progressStatus = "loading";
            root.progressText = "Updating local avatar...";
            Notifications.notify({
                summary: "Not signed in",
                body: "Updating local avatar only. Sign in to sync across devices."
            });
            root._avatarSrc = clean;
            const p = setAvatarComp.createObject(root);
            p.command = ["cp", clean, root.avatarPath];
            p.running = true;
            return;
        }
        root._avatarSrc = clean;
        root._avatarUid = uid;
        root._avatarContentType = ctype;
        root._avatarExt = ext === "jpeg" ? "jpg" : ext;
        root.progressStatus = "loading";
        root.progressText = "Uploading avatar...";
        // Convert non-JPEG via magick/convert (AGS uploadCurrentUserAvatar);
        // failures fall back to the original file inside the chain step.
        if (ext === "jpg" || ext === "jpeg") {
            root._avatarUploadPath = clean;
            root.avatarUpload();
        } else {
            const p = avatarConvertComp.createObject(root);
            p.command = ["bash", "-c", "magick " + JSON.stringify(clean) + " " + JSON.stringify("/tmp/" + uid + "-avatar.jpg") + " || convert " + JSON.stringify(clean) + " " + JSON.stringify("/tmp/" + uid + "-avatar.jpg")];
            p.running = true;
        }
    }

    function onAvatarConverted(ok) {
        const tmp = "/tmp/" + root._avatarUid + "-avatar.jpg";
        if (ok) {
            root._avatarUploadPath = tmp;
            root._avatarContentType = "image/jpeg";
            root._avatarExt = "jpg";
        } else {
            Notifications.notify({
                summary: "Image conversion warning",
                body: "Conversion failed, uploading original file."
            });
            root._avatarUploadPath = root._avatarSrc;
        }
        root.avatarUpload();
    }

    function avatarUpload() {
        const p = avatarUploadComp.createObject(root);
        p.command = ["curl", "-sS", "-X", "PUT", "-H", "Content-Type: " + root._avatarContentType, "-H", "apikey: " + root.supabaseKey, "-H", "Authorization: Bearer " + (root._cachedSession?.access_token ?? ""), "-H", "x-upsert: true", "--data-binary", "@" + root._avatarUploadPath, root.supabaseUrl + "/storage/v1/object/avatars/" + root._avatarUid + "." + root._avatarExt];
        p.running = true;
    }

    function onAvatarUploaded(ok) {
        if (!ok) {
            root.progressStatus = "error";
            root.progressText = "Upload failed";
            Notifications.notify({
                summary: "Upload failed",
                body: "Failed to upload profile picture."
            });
            return;
        }
        const url = root.supabaseUrl + "/storage/v1/object/public/avatars/" + root._avatarUid + "." + root._avatarExt;
        root._avatarUrl = url;
        const p = avatarPatchComp.createObject(root);
        p.command = ["bash", "-c", "curl -sS -X PATCH -H 'Content-Type: application/json' -H 'apikey: " + root.supabaseKey + "' -H 'Authorization: Bearer " + (root._cachedSession?.access_token ?? "") + "' -H 'Prefer: return=representation' -d " + JSON.stringify(JSON.stringify({
                avatar: url
            })) + " " + JSON.stringify(root.supabaseUrl + "/rest/v1/user_profiles?id=eq." + encodeURIComponent(root._avatarUid))];
        p.running = true;
    }
    property string _avatarUrl: ""

    function onAvatarPatched(ok) {
        if (!ok) {
            root.progressStatus = "error";
            root.progressText = "Upload failed";
            Notifications.notify({
                summary: "Upload failed",
                body: "Failed to update profile picture."
            });
            return;
        }
        // Sync the fresh avatar down to ~/.face.icon (AGS syncAvatarToFaceIcon,
        // without the 10s delay — immediate keeps the UI truthful).
        const p = avatarFetchComp.createObject(root);
        p.command = ["curl", "-sS", "--max-time", "30", "-o", root.avatarPath, root._avatarUrl];
        p.running = true;
    }

    function onAvatarFetched(ok) {
        if (!ok) {
            Notifications.notify({
                summary: "Avatar sync failed",
                body: "Uploaded, but the local picture could not be refreshed — will retry on next refresh."
            });
            root.progressStatus = "error";
            root.progressText = "Avatar sync failed";
            return;
        }
        root.progressStatus = "success";
        root.progressText = "Avatar updated";
        Notifications.notify({
            summary: "Avatar updated",
            body: "Your profile picture has been uploaded."
        });
        root.avatarPathChanged();
        root.loadProfile();
    }

    function maskEmail(email) {
        if (!email)
            return "No email";
        const at = email.indexOf("@");
        if (at <= 0)
            return email;
        return email.slice(0, 1) + "***@" + email.slice(at + 1);
    }

    // ===== UI: MINIMAL MODE (AGS UserProfileMinimal: avatar + 2em username on a pill) =====
    Item {
        id: minimalView
        anchors.fill: parent
        visible: root.minimal
        Column {
            anchors.centerIn: parent
            width: root.width
            spacing: 10
            Rectangle {
                // Centered manually: parent is a Column positioner,
                // which ignores anchors on children.
                x: (parent.width - width) / 2
                width: Math.min(root.width * 0.5, 140)
                height: Math.min(root.width * 0.5, 140)
                radius: width / 2
                clip: true
                AppImage {
                    id: minAvatarImg
                    anchors.fill: parent
                    source: root.avatarSrc

                    visible: status === Image.Ready
                }
                Rectangle {
                    anchors.fill: parent
                    color: Theme.accentBg
                    visible: minAvatarImg.status !== Image.Ready
                    Text {
                        anchors.centerIn: parent
                        text: "\u{F007}"
                        font.pixelSize: 56
                        color: Theme.accent
                    }
                }
            }
            Text {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                text: root.profile?.username ?? "Not signed in"
                font.pixelSize: Theme.fontSize * 2
                font.bold: true
                color: Theme.foreground
                elide: Text.ElideRight
            }
        }
    }

    // ===== UI: FULL MODE =====
    Column {
        id: fullView
        anchors.fill: parent
        spacing: 10
        visible: !root.minimal

        // Tab buttons
        Row {
            id: tabRow
            width: parent.width
            spacing: 6
            AppButton {
                width: (parent.width - 6) / 2
                implicitHeight: 30
                toggle: true
                checked: root.activeTab === 0
                outlined: true
                text: "Account"
                onClicked: root.activeTab = 0
            }
            AppButton {
                width: (parent.width - 6) / 2
                implicitHeight: 30
                toggle: true
                checked: root.activeTab === 1
                outlined: true
                text: "About"
                onClicked: root.activeTab = 1
            }
        }

        // Stack: Account | About (unanchored: StackLayout children
        // must not use anchors; height derives from the tab row above).
        StackLayout {
            width: parent.width
            height: parent.height - tabRow.height - fullView.spacing
            currentIndex: root.activeTab

            // Account tab (AGS scrolledwindow: scrolls on narrow panels)
            SmoothFlickable {
                id: acctFlick
                width: parent.width
                height: parent.height
                contentWidth: width
                contentHeight: acctCol.height
                flickableDirection: Flickable.VerticalFlick
                clip: true
                Column {
                    id: acctCol
                    width: acctFlick.width
                    spacing: 10

                    // ── Identity card: avatar banner spanning the width ──
                    // Margins stay intact: the banner sizes explicitly off
                    // the padded column (width = card − margins), square via
                    // height: width — no edge anchors to overextend.
                    Rectangle {
                        width: parent.width
                        implicitHeight: cardCol.implicitHeight + 20
                        color: Theme.bg
                        radius: 8
                        border.color: Theme.border

                        Column {
                            id: cardCol
                            anchors.left: parent.left
                            anchors.right: parent.right
                            anchors.top: parent.top
                            anchors.margins: 10
                            spacing: 10

                            Rectangle {
                                id: banner
                                width: parent.width
                                height: width
                                radius: Theme.radius
                                color: Theme.bg
                                clip: true
                                AppImage {
                                    id: avatarImg
                                    anchors.fill: parent
                                    source: root.avatarSrc
                                    visible: status === Image.Ready
                                }
                                Rectangle {
                                    anchors.fill: parent
                                    color: Theme.accentBg
                                    visible: avatarImg.status !== Image.Ready
                                    Text {
                                        anchors.centerIn: parent
                                        text: "\u{F007}"
                                        font.pixelSize: 48
                                        color: Theme.accent
                                    }
                                }
                                MouseArea {
                                    id: avatarMa
                                    anchors.fill: parent
                                    onClicked: root.chooseAvatar()
                                    ToolTip.visible: avatarMa.containsMouse
                                    ToolTip.text: "Click to set up profile picture"
                                }
                            }

                            Column {
                                id: idCol
                                width: parent.width
                                spacing: 6
                                AppTextField {
                                    id: usernameField
                                    width: parent.width
                                    cornerRadius: 4
                                    placeholderText: homeDir.split("/").pop()
                                    text: root.profile?.username ?? ""
                                    horizontalAlignment: TextInput.AlignHCenter
                                    onAccepted: root.updateProfile()
                                    // AGS username entry tooltip
                                    ToolTip.delay: 600
                                    ToolTip.text: "Click to edit username"
                                    ToolTip.visible: hovered
                                }
                                Flow {
                                    width: parent.width
                                    spacing: 5
                                    Label {
                                        text: root.maskEmail(root.profile?.email ?? "")
                                        font.pixelSize: Theme.fontSize - 1
                                        color: Theme.fgDim
                                    }
                                    Label {
                                        text: "|"
                                        font.pixelSize: Theme.fontSize - 1
                                        color: Theme.fgDim
                                    }
                                    Label {
                                        text: "Supporter: " + (root.profile?.is_supporter ? "Yes" : "No")
                                        font.pixelSize: Theme.fontSize - 1
                                        color: Theme.fgDim
                                    }
                                }
                                Label {
                                    width: parent.width
                                    text: root.progressText
                                    font.pixelSize: Theme.fontSize - 1
                                    color: root.progressStatus === "error" ? Theme.danger : root.progressStatus === "success" ? Theme.accent : Theme.fgDim
                                    wrapMode: Text.WordWrap
                                }
                            }
                        }
                    }

                    Row {
                        width: parent.width
                        spacing: 8
                        visible: !!root.profile
                        AppButton {
                            width: (parent.width - 16) / 3
                            text: "Update"
                            onClicked: root.updateProfile()
                        }
                        AppButton {
                            width: (parent.width - 16) / 3
                            text: "Refresh"
                            tooltipText: "Refresh profile"
                            enabled: !root.isRefreshing
                            // AGS awaits loadProfile in try/finally — the flag
                            // clears when the fetch completes (see fetchProfileComp
                            // + handleSessionJson), not synchronously here.
                            onClicked: {
                                if (root.isRefreshing)
                                    return;
                                root.isRefreshing = true;
                                root.progressStatus = "loading";
                                root.progressText = "Refreshing profile...";
                                root.loadProfile();
                            }
                        }
                        AppButton {
                            width: (parent.width - 16) / 3
                            text: "Logout"
                            onClicked: root.logout()
                        }
                    }

                    Rectangle {
                        width: parent.width
                        implicitHeight: syncCol.implicitHeight + 20
                        visible: !!root.profile
                        color: Theme.bg
                        radius: 8
                        border.color: Theme.border

                        Column {
                            id: syncCol
                            anchors.left: parent.left
                            anchors.right: parent.right
                            anchors.top: parent.top
                            anchors.margins: 10
                            spacing: 8
                            Label {
                                text: "Settings Sync"
                                font.pixelSize: Theme.fontSize + 2
                                font.bold: true
                                color: Theme.fg
                            }
                            Row {
                                width: parent.width
                                spacing: 8
                                AppButton {
                                    width: (parent.width - 8) / 2
                                    text: root.isSyncing ? "Downloading..." : "Download"
                                    enabled: !root.isSyncing
                                    tooltipText: "Download settings from cloud"
                                    onClicked: root.syncSettings("download")
                                }
                                AppButton {
                                    width: (parent.width - 8) / 2
                                    text: root.isSyncing ? "Uploading..." : "Upload"
                                    enabled: !root.isSyncing
                                    tooltipText: "Upload settings to cloud"
                                    onClicked: root.syncSettings("upload")
                                }
                            }
                            Label {
                                width: parent.width
                                text: "Last sync: " + root.lastSyncAt
                                font.pixelSize: Theme.fontSize - 1
                                color: Theme.fgDim
                                elide: Text.ElideRight
                            }
                            Label {
                                width: parent.width
                                text: "Last result: " + root.lastSyncResult
                                font.pixelSize: Theme.fontSize - 1
                                color: Theme.fgDim
                                elide: Text.ElideRight
                            }
                            Label {
                                width: parent.width
                                text: "Remote updated: " + root.lastRemoteUpdatedAt
                                font.pixelSize: Theme.fontSize - 1
                                color: Theme.fgDim
                                elide: Text.ElideRight
                            }
                        }
                    }

                    // AGS UserProfile.tsx:524-555 — favorites + pins side by side.
                    Row {
                        width: parent.width
                        spacing: 10
                        visible: !!root.profile
                        Rectangle {
                            width: (parent.width - 10) / 2
                            implicitHeight: favCol.implicitHeight + 20
                            color: Theme.bg
                            radius: 8
                            border.color: Theme.border
                            Column {
                                id: favCol
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.top: parent.top
                                anchors.margins: 10
                                spacing: 5
                                Label {
                                    text: "Booru Favorites"
                                    font.pixelSize: Theme.fontSize
                                    font.bold: true
                                    color: Theme.fg
                                }
                                Repeater {
                                    model: root.booruApis
                                    delegate: Row {
                                        width: parent.width
                                        spacing: 5
                                        Label {
                                            width: parent.width - 32
                                            text: modelData.name
                                            font.pixelSize: Theme.fontSize - 1
                                            color: Theme.fg
                                            elide: Text.ElideRight
                                        }
                                        Label {
                                            width: 27
                                            horizontalAlignment: Text.AlignRight
                                            text: root.profile ? String(root.booruFavoriteCounts[modelData.value] ?? 0) : ""
                                            font.pixelSize: Theme.fontSize - 1
                                            color: Theme.fgDim
                                        }
                                    }
                                }
                            }
                        }
                        Rectangle {
                            width: (parent.width - 10) / 2
                            implicitHeight: pinCol.implicitHeight + 20
                            color: Theme.bg
                            radius: 8
                            border.color: Theme.border
                            Column {
                                id: pinCol
                                anchors.left: parent.left
                                anchors.right: parent.right
                                anchors.top: parent.top
                                anchors.margins: 10
                                spacing: 5
                                Label {
                                    text: "Pinned Images"
                                    font.pixelSize: Theme.fontSize
                                    font.bold: true
                                    color: Theme.fg
                                }
                                Label {
                                    width: parent.width
                                    text: "Fastfetch cache"
                                    font.pixelSize: Theme.fontSize - 1
                                    color: Theme.fg
                                    elide: Text.ElideRight
                                }
                                Label {
                                    width: parent.width
                                    text: root.profile ? String(root.pinnedCount) : ""
                                    font.pixelSize: Theme.fontSize + 2
                                    font.bold: true
                                    color: Theme.accent
                                }
                            }
                        }
                    }

                    Rectangle {
                        width: parent.width
                        implicitHeight: signCol.implicitHeight + 20
                        visible: !root.profile
                        color: Theme.bg
                        radius: 8
                        border.color: Theme.border
                        Column {
                            id: signCol
                            anchors.left: parent.left
                            anchors.right: parent.right
                            anchors.top: parent.top
                            anchors.margins: 10
                            spacing: 10
                            Label {
                                text: "Sign in to sync"
                                font.pixelSize: Theme.fontSize + 1
                                font.bold: true
                                color: Theme.fg
                            }
                            Label {
                                width: parent.width
                                text: "\u2022 Profile picture\n\u2022 Settings\n\u2022 More to come"
                                font.pixelSize: Theme.fontSize - 1
                                color: Theme.fgDim
                                wrapMode: Text.WordWrap
                            }
                            AppTextField {
                                id: emailField
                                width: parent.width
                                cornerRadius: 4
                                placeholderText: "you@example.com"
                                text: ""
                                onAccepted: root.sendMagicLink(emailField.text)
                                onTextChanged: {
                                    if (root.magicState !== "Send Magic Link")
                                        root.magicState = "Send Magic Link";
                                }
                            }
                            AppButton {
                                text: root.magicState
                                width: parent.width
                                enabled: emailField.text.trim().length > 0
                                onClicked: root.sendMagicLink(emailField.text)
                            }
                        }
                    }
                }
            }

            // About tab (StackLayout auto-sizes children: no anchors here)
            GeneralTab {}
        }
    }

    // Hidden Process components for async operations (wrapped in Component for createObject).
    // Exit-code rule: onStreamFinished parses payloads; onExited with a
    // non-zero code overrides to the error state (curl -sS still exits 0 on
    // HTTP errors only when -f is absent — network/DNS failures exit non-zero).
    Component {
        id: netGateComp
        Process {
            onExited: code => root.onNetGateDone(code === 0)
        }
    }
    Component {
        id: pollSessionComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: root.onPollSession(text)
            }
        }
    }
    Component {
        id: loadAuthComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: root.handleSessionJson(text)
            }
        }
    }
    Component {
        id: fetchProfileComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    const parts = text.split("---SEP---");
                    if (parts.length === 2) {
                        try {
                            const user = JSON.parse(parts[0].trim());
                            const prof = JSON.parse(parts[1].trim());
                            if (prof?.[0]) {
                                root.profile = {
                                    id: user?.id,
                                    email: user?.email,
                                    username: prof[0].username,
                                    avatar: prof[0].avatar,
                                    is_supporter: prof[0].is_supporter
                                };
                                root.progressStatus = "idle";
                                root.progressText = (prof[0].username ?? "No username") + " \u2022 " + (prof[0].is_supporter ? "Supporter" : "Member");
                                // AGS syncAvatarToFaceIcon on every load:
                                // silent download, notify only on failure.
                                if (prof[0].avatar)
                                    root.syncAvatarSilent(prof[0].avatar);
                            } else {
                                root.profile = null;
                                root.progressStatus = "error";
                                root.progressText = "Profile not found";
                            }
                        } catch (e) {
                            root.profile = null;
                            root.progressStatus = "error";
                            root.progressText = "Failed to parse profile";
                        }
                    }
                }
            }
            onExited: code => {
                root.isRefreshing = false;
                if (code !== 0) {
                    root.progressStatus = "error";
                    root.progressText = root.profile ? "Refresh failed" : "Profile fetch failed";
                }
            }
        }
    }
    Component {
        id: magicLinkComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    try {
                        const r = JSON.parse(text);
                        if (r.error) {
                            Notifications.notify({
                                summary: "Error",
                                body: r.error
                            });
                        } else {
                            root.magicState = "Check email...";
                            Notifications.notify({
                                summary: "Magic link sent",
                                body: "Check your email and open the link to complete sign-in."
                            });
                        }
                    } catch (e) {
                        Notifications.notify({
                            summary: "Error",
                            body: "Failed to send magic link"
                        });
                    }
                }
            }
        }
    }
    Component {
        id: authServerComp
        Process {}
    }
    Component {
        id: updateProfileComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    try {
                        const r = JSON.parse(text);
                        if (r?.[0]?.username) {
                            root.progressStatus = "success";
                            root.progressText = "Profile updated";
                            Notifications.notify({
                                summary: "Profile updated",
                                body: "Your profile has been updated successfully."
                            });
                            root.loadProfile();
                        } else {
                            root.progressStatus = "error";
                            root.progressText = "Update failed";
                            Notifications.notify({
                                summary: "Update failed",
                                body: "Failed to update profile."
                            });
                        }
                    } catch (e) {
                        root.progressStatus = "error";
                        root.progressText = "Update failed";
                        Notifications.notify({
                            summary: "Update failed",
                            body: "Failed to update profile."
                        });
                    }
                }
            }
        }
    }
    Component {
        id: logoutComp
        Process {
            command: ["rm", "-f", root.authSessionPath]
        }
    }
    // AGS settings-sync.ts SettingsSyncMeta is camelCase {lastSyncAt,
    // lastDirection, lastRemoteUpdatedAt}; direction maps to human labels
    // (UserProfile.tsx lastSyncResult).
    Component {
        id: readMetaComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    try {
                        const m = JSON.parse(text);
                        root.lastSyncAt = m?.lastSyncAt ? root.formatTs(m.lastSyncAt) : "Never";
                        const d = m?.lastDirection;
                        root.lastSyncResult = !d ? "-" : d === "noop" ? "Up to date" : d === "download" ? "Downloaded" : "Uploaded";
                        root.lastRemoteUpdatedAt = m?.lastRemoteUpdatedAt ? root.formatTs(m.lastRemoteUpdatedAt) : "Never";
                    } catch (e) {
                        root.lastSyncAt = "Never";
                        root.lastSyncResult = "-";
                        root.lastRemoteUpdatedAt = "Never";
                    }
                }
            }
        }
    }
    function writeSyncMeta(direction, remoteUpdatedAt) {
        const p = metaWriteComp.createObject(root);
        p.command = ["bash", "-c", "cat > " + JSON.stringify(root.settingsMetaPath) + " <<'EOF'\n" + JSON.stringify({
                lastSyncAt: new Date().toISOString(),
                lastDirection: direction,
                lastRemoteUpdatedAt: remoteUpdatedAt || null
            }, null, 2) + "\nEOF"];
        p.running = true;
    }
    Component {
        id: syncUploadComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    try {
                        const r = JSON.parse(text);
                        root._syncOut = JSON.stringify(r);
                    } catch (e) {
                        root._syncOut = "";
                    }
                }
            }
            onExited: code => {
                root.isSyncing = false;
                if (code !== 0 || !root._syncOut) {
                    root.progressStatus = "error";
                    root.progressText = "Upload failed";
                    Notifications.notify({
                        summary: "Settings Sync",
                        body: "Upload failed."
                    });
                    return;
                }
                try {
                    const r = JSON.parse(root._syncOut);
                    const updated = r?.updated_at ?? (Array.isArray(r) ? r[0]?.updated_at : null);
                    root.writeSyncMeta("upload", updated);
                    root.progressStatus = "success";
                    root.progressText = "Settings uploaded";
                    Notifications.notify({
                        summary: "Settings Sync",
                        body: "Uploaded to cloud"
                    });
                    root.applySettingsSyncMeta();
                } catch (e) {
                    root.progressStatus = "error";
                    root.progressText = "Upload failed";
                    Notifications.notify({
                        summary: "Settings Sync",
                        body: "Upload failed."
                    });
                }
            }
        }
    }
    property string _syncOut: ""
    Component {
        id: syncDownloadComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    root._syncOut = text;
                }
            }
            onExited: code => {
                root.isSyncing = false;
                if (code !== 0) {
                    root.progressStatus = "error";
                    root.progressText = "Download failed";
                    Notifications.notify({
                        summary: "Settings Sync",
                        body: "Download failed."
                    });
                    return;
                }
                try {
                    const r = JSON.parse(root._syncOut);
                    if (r?.[0]?.settings) {
                        const p = writeSettingsComp.createObject(root);
                        p.command = ["bash", "-c", "cat > " + root.settingsPath + " <<'EOF'\n" + JSON.stringify(r[0].settings, null, 2) + "\nEOF"];
                        p.running = true;
                        root.writeSyncMeta("download", r[0].updated_at);
                        root.progressStatus = "success";
                        root.progressText = "Settings downloaded";
                        Notifications.notify({
                            summary: "Settings Sync",
                            body: "Downloaded from cloud"
                        });
                        root.applySettingsSyncMeta();
                    } else {
                        root.isSyncing = false;
                        root.progressStatus = "error";
                        root.progressText = "No settings found";
                        Notifications.notify({
                            summary: "Settings Sync",
                            body: "No remote settings found."
                        });
                    }
                } catch (e) {
                    root.progressStatus = "error";
                    root.progressText = "Download failed";
                    Notifications.notify({
                        summary: "Settings Sync",
                        body: "Download failed."
                    });
                }
            }
        }
    }
    Component {
        id: writeSettingsComp
        Process {}
    }
    Component {
        id: metaWriteComp
        Process {}
    }
    // zenity exits 1 on cancel — silent, like AGS catching "exit status 1".
    Component {
        id: zenityComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    root._zenityOut = text.trim();
                }
            }
            onExited: code => {
                if (code === 0)
                    root.onAvatarPicked(root._zenityOut);
                else if (code !== 1)
                    Notifications.notify({
                        summary: "Avatar picker failed",
                        body: "Could not open the file picker."
                    });
            }
        }
    }
    property string _zenityOut: ""
    // Local-only avatar copy (not signed in): progress + reload on success.
    Component {
        id: setAvatarComp
        Process {
            onExited: code => {
                if (code !== 0) {
                    root.progressStatus = "error";
                    root.progressText = "Local update failed";
                    Notifications.notify({
                        summary: "Local update failed",
                        body: "Could not copy the selected picture."
                    });
                    return;
                }
                root.progressStatus = "success";
                root.progressText = "Avatar updated locally";
                Notifications.notify({
                    summary: "Avatar updated",
                    body: "Using the selected picture locally."
                });
                root.reloadAvatar();
            }
        }
    }
    Component {
        id: avatarConvertComp
        Process {
            onExited: code => root.onAvatarConverted(code === 0)
        }
    }
    Component {
        id: avatarUploadComp
        Process {
            stdout: StdioCollector {
                onStreamFinished: {
                    root._avatarUpOut = text;
                }
            }
            onExited: code => root.onAvatarUploaded(code === 0)
        }
    }
    property string _avatarUpOut: ""
    Component {
        id: avatarPatchComp
        Process {
            onExited: code => root.onAvatarPatched(code === 0)
        }
    }
    Component {
        id: avatarFetchComp
        Process {
            onExited: code => {
                root.reloadAvatar();
                root.onAvatarFetched(code === 0);
            }
        }
    }
    // Silent avatar sync on profile load (AGS syncAvatarToFaceIcon):
    // no success notification, failure notifies once (retried next load).
    function syncAvatarSilent(url) {
        if (!url)
            return;
        const p = avatarSyncComp.createObject(root);
        p.command = ["curl", "-sS", "--max-time", "30", "-o", root.avatarPath, url];
        p.running = true;
    }
    Component {
        id: avatarSyncComp
        Process {
            onExited: code => {
                if (code === 0) {
                    root.reloadAvatar();
                } else {
                    Notifications.notify({
                        summary: "Avatar sync failed",
                        body: "Could not refresh the local picture — will retry on next refresh."
                    });
                }
            }
        }
    }
}
