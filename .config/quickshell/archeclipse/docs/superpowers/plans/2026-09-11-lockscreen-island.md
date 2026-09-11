# Lockscreen Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the insecure UserPanel overlay with a real compositor-enforced lockscreen (WlSessionLock + PAM) showing a lock icon, password input, and four direct power actions over a blurred/dimmed background.

**Architecture:** A single `LockScreen` scope in shell.qml owns a shared `LockContext` (PAM auth state) and a `WlSessionLock` whose per-screen `WlSessionLockSurface` hosts `LockSurface` (fullscreen MouseArea + dim + centered card). Input blocking comes from ext-session-lock-v1, not layer tricks.

**Tech Stack:** Quickshell QML (QtQuick, Quickshell, Quickshell.Wayland, Quickshell.Services.Pam, Quickshell.Hyprland), existing ArchEclipse Theme/AppTextField/AppButton/Registry/Ipc patterns.

**Spec:** `docs/superpowers/specs/2026-09-11-lockscreen-design.md`

## Global Constraints

- Real secure lock via WlSessionLock + PAM default `login` stack; no debug bypass, no custom pam configDirectory.
- Four power actions run DIRECTLY without password: logout, shutdown, sleep (keeps lock engaged, expect hyprlock double-lock on wake), reboot.
- Full replace of UserPanel in shell.qml; keep `togglePanel user-panel*` compat routing to lock.
- Background is transparent session-lock surface + fullscreen dim `Qt.rgba(0,0,0,0.45)` for compositor blur.
- Password cleared on success, failure, lock, and 10s idle; empty password never starts PAM.
- Never quit/restart the shell while locked without unlocking first.
- Stage only the listed files per commit; never `git add .` (repo has unrelated working-tree modifications).

---

## File Structure

- `widgets/lock/qmldir` — module declaration `qs.widgets.lock`.
- `widgets/lock/LockContext.qml` — shared auth state (Scope): screenLocked, currentText, unlockInProgress, showFailure, screenUnlockFailed, 10s auto-clear timer, tryUnlock/reset, PamContext on `login` stack.
- `widgets/lock/LockSurface.qml` — per-screen UI: fullscreen MouseArea + dim + centered card (lock glyph, password AppTextField, error + shake, Row of 4 direct AppButtons).
- `widgets/lock/LockScreen.qml` — owner scope: LockContext + WlSessionLock + IPC `lock` target + GlobalShortcuts + Registry `lock-screen` handle with `lock()`/`focusLock()`.
- `shell.qml` — drop userPanel import + UserPanel Variants, add lock import + `LockScreen {}`.
- `services/Ipc.qml` — `togglePanel user-panel*` compat routes to lock-screen handle.

---

### Task 1: LockContext (shared PAM auth state)

**Files:**
- Create: `widgets/lock/LockContext.qml`
- Create: `widgets/lock/qmldir`

**Interfaces:**
- Consumes: `Quickshell.Services.Pam PamContext` (default `login` stack in `/etc/pam.d`), QtQuick Timer.
- Produces (used by Tasks 2–3 — exact names): `property bool screenLocked`, `property string currentText`, `property bool unlockInProgress`, `property bool showFailure`, `property bool screenUnlockFailed`, `signal shouldReFocus()`, `signal unlocked()`, `signal failed()`, `function clearText()`, `function reset()`, `function resetClearTimer()`, `function tryUnlock()`.

- [ ] **Step 1: Create the qmldir**

Create `widgets/lock/qmldir` with exactly:

```
module qs.widgets.lock

LockContext 1.0 LockContext.qml
LockSurface 1.0 LockSurface.qml
LockScreen 1.0 LockScreen.qml
```

- [ ] **Step 2: Write LockContext.qml**

Create `widgets/lock/LockContext.qml` with exactly:

```qml
import QtQuick
import Quickshell
import Quickshell.Services.Pam

// Shared auth state for all per-screen lock surfaces (end-4 LockContext pattern).
// Security notes: default `login` PAM stack (no custom configDirectory), respond
// only when responseRequired, clear the password on success/failure/lock/idle,
// never start PAM with an empty password.
Scope {
    id: root

    signal shouldReFocus()
    signal unlocked()
    signal failed()

    property bool screenLocked: false
    property string currentText: ""
    property bool unlockInProgress: false
    property bool showFailure: false
    property bool screenUnlockFailed: false

    function clearText() {
        root.currentText = "";
    }
    function reset() {
        root.clearText();
        root.unlockInProgress = false;
        root.showFailure = false;
    }
    function resetClearTimer() {
        passwordClearTimer.restart();
    }
    function tryUnlock() {
        if (root.currentText === "" || root.unlockInProgress)
            return;
        root.unlockInProgress = true;
        pam.start();
    }

    Timer {
        id: passwordClearTimer
        interval: 10000
        onTriggered: root.reset()
    }
    onCurrentTextChanged: {
        if (currentText.length > 0) {
            root.showFailure = false;
            root.screenUnlockFailed = false;
        }
        passwordClearTimer.restart();
    }

    PamContext {
        id: pam
        onPamMessage: {
            if (this.responseRequired)
                this.respond(root.currentText);
        }
        onCompleted: result => {
            if (result === PamResult.Success) {
                root.clearText();
                root.unlockInProgress = false;
                root.unlocked();
            } else {
                root.clearText();
                root.unlockInProgress = false;
                root.screenUnlockFailed = true;
                root.showFailure = true;
                root.failed();
            }
        }
        onError: {
            root.clearText();
            root.unlockInProgress = false;
            root.screenUnlockFailed = true;
            root.showFailure = true;
            root.failed();
        }
    }
}
```

- [ ] **Step 3: Lint the new files**

Run: `qmllint widgets/lock/LockContext.qml`
Expected: PASS (no output, exit 0).

- [ ] **Step 4: Commit**

```bash
git add widgets/lock/qmldir widgets/lock/LockContext.qml
git commit -m "feat(lock): add LockContext with PAM auth state"
```

---

### Task 2: LockSurface (per-screen lock UI)

**Files:**
- Create: `widgets/lock/LockSurface.qml`

**Interfaces:**
- Consumes: Task 1 `LockContext` via `required property var context` (calls `context.currentText`, `context.tryUnlock()`, `context.resetClearTimer()`, reads `context.unlockInProgress` / `context.showFailure` / `context.screenUnlockFailed`); `qs.theme Theme`; `qs.widgets.shared AppTextField`, `AppButton`.
- Produces: fullscreen lock surface UI; no new API (pure visual consumer of context).

- [ ] **Step 1: Write LockSurface.qml**

Create `widgets/lock/LockSurface.qml` with exactly:

```qml
import QtQuick
import Quickshell
import Quickshell.Hyprland
import qs.theme
import qs.widgets.shared

// Per-screen lock UI, hosted inside a transparent WlSessionLockSurface.
// Fullscreen MouseArea keeps the password focused (click/hover refocus,
// Esc clears); fullscreen dim lets the Hyprland compositor blur show through.
MouseArea {
    id: root
    required property var context

    hoverEnabled: true
    acceptedButtons: Qt.LeftButton
    onPressed: passwordField.forceActiveFocus()
    onPositionChanged: passwordField.forceActiveFocus()

    function forceFieldFocus() {
        passwordField.forceActiveFocus();
    }
    Connections {
        target: root.context
        function onShouldReFocus() {
            root.forceFieldFocus();
        }
    }
    Component.onCompleted: root.forceFieldFocus()

    Keys.onPressed: event => {
        root.context.resetClearTimer();
        if (event.key === Qt.Key_Escape)
            root.context.currentText = "";
        root.forceFieldFocus();
    }

    // Whole-background dim over the transparent session-lock surface.
    Rectangle {
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.45)
    }

    // Centered card: lock icon + password + 4 direct actions.
    Rectangle {
        id: card
        anchors.centerIn: parent
        width: 340
        height: cardCol.implicitHeight + 40
        radius: 24
        color: Theme.bg
        border.color: Theme.border
        border.width: 1

        Column {
            id: cardCol
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.margins: 20
            spacing: 12

            Text {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                text: ""
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize * 4
                color: Theme.fg
            }
            Text {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                text: "Locked"
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize + 4
                font.bold: true
                color: Theme.fg
            }
            AppTextField {
                id: passwordField
                width: parent.width
                cornerRadius: 12
                placeholderText: root.context.screenUnlockFailed ? "Incorrect password" : "Enter password"
                echoMode: TextInput.Password
                inputMethodHints: Qt.ImhSensitiveData
                enabled: !root.context.unlockInProgress
                text: root.context.currentText
                onTextChanged: root.context.currentText = text
                onAccepted: root.context.tryUnlock()
                Keys.onPressed: event => root.context.resetClearTimer()
                Component.onCompleted: forceActiveFocus()
            }
            Text {
                width: parent.width
                horizontalAlignment: Text.AlignHCenter
                visible: root.context.showFailure
                text: "Incorrect password — try again"
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSize - 1
                color: Theme.danger
            }
            Row {
                width: parent.width
                spacing: 8
                AppButton {
                    width: (parent.width - 24) / 4
                    icon: ""
                    tooltipText: "Logout from Hyprland"
                    onClicked: Hyprland.dispatch("exit")
                }
                AppButton {
                    width: (parent.width - 24) / 4
                    icon: ""
                    tooltipText: "Shutdown immediately"
                    onClicked: Quickshell.execDetached(["shutdown", "now"])
                }
                AppButton {
                    width: (parent.width - 24) / 4
                    icon: ""
                    tooltipText: "Put system to sleep"
                    onClicked: Quickshell.execDetached(["bash", "-c", Quickshell.env("HOME") + "/.config/hypr/scripts/hyprlock.sh suspend"])
                }
                AppButton {
                    width: (parent.width - 24) / 4
                    icon: ""
                    tooltipText: "Reboot immediately"
                    onClicked: Quickshell.execDetached(["reboot"])
                }
            }
        }

        // Shake on wrong password.
        SequentialAnimation {
            id: shakeAnim
            NumberAnimation { target: card; property: "x"; to: card.x - 14; duration: 50 }
            NumberAnimation { target: card; property: "x"; to: card.x + 14; duration: 50 }
            NumberAnimation { target: card; property: "x"; to: card.x - 8; duration: 40 }
            NumberAnimation { target: card; property: "x"; to: card.x + 8; duration: 40 }
        }
        Connections {
            target: root.context
            function onShowFailureChanged() {
                if (root.context.showFailure)
                    shakeAnim.restart();
            }
        }
    }
}
```

Notes the implementer must preserve: glyphs match UserPanel (`` logout, `` power, `` sleep, `` reboot — same handler commands as `UserPanel.qml:187-233`, including `hyprlock.sh suspend` for sleep); `Hyprland.dispatch("exit")` matches the repo's `hl.dsp.exit` intent via the Quickshell Hyprland API.

- [ ] **Step 2: Sync the password field both ways**

The Step 1 code already binds `text: root.context.currentText` and writes back in `onTextChanged`. Verify both lines exist:

Run: `grep -n "context.currentText" widgets/lock/LockSurface.qml`
Expected: at least 3 hits (`placeholderText` line excluded — look for `text: root.context.currentText`, `onTextChanged: root.context.currentText = text`, Esc-clear line).

- [ ] **Step 3: Lint**

Run: `qmllint widgets/lock/LockSurface.qml`
Expected: PASS (no output, exit 0).

- [ ] **Step 4: Commit**

```bash
git add widgets/lock/LockSurface.qml
git commit -m "feat(lock): add LockSurface with password card and direct actions"
```

---

### Task 3: LockScreen scope (session lock + IPC + shortcuts)

**Files:**
- Create: `widgets/lock/LockScreen.qml`

**Interfaces:**
- Consumes: Task 1 `LockContext` (owns one instance as `lockContext`; exposes as `property alias context`); Task 2 `LockSurface` (instantiated per screen inside `WlSessionLockSurface`).
- Produces: Registry handle `"lock-screen"` with `function lock()` and `function focusLock()` (used by Task 4 compat); IPC target `"lock"` with `activate()` and `focus()`; GlobalShortcuts `lock` / `lockFocus`.

- [ ] **Step 1: Write LockScreen.qml**

Create `widgets/lock/LockScreen.qml` with exactly:

```qml
import QtQuick
import Quickshell
import Quickshell.Wayland
import Quickshell.Hyprland
import qs.services

// Single owner scope for the secure lock (replaces the per-monitor UserPanel
// Variants). The compositor creates one WlSessionLockSurface per screen, so
// no Variants wrapper is needed. Input blocking is compositor-enforced via
// ext-session-lock-v1; `secure` is true once all screens are covered.
Scope {
    id: root

    property alias context: lockContext

    function lock() {
        lockContext.reset();
        lockContext.screenLocked = true;
    }
    function focusLock() {
        lockContext.shouldReFocus();
    }

    Component.onCompleted: Registry.register("lock-screen", root)
    Component.onDestruction: Registry.unregister("lock-screen")

    LockContext {
        id: lockContext
        // Unlock the session before anything else: quitting or destroying the
        // lock while still locked leaves the compositor fallback lock, which
        // cannot be interacted with.
        onUnlocked: lockContext.screenLocked = false
    }

    WlSessionLock {
        id: sessionLock
        locked: lockContext.screenLocked

        WlSessionLockSurface {
            color: "transparent"
            LockSurface {
                anchors.fill: parent
                context: lockContext
            }
        }
    }

    IpcHandler {
        target: "lock"
        function activate(): void {
            root.lock();
        }
        function focus(): void {
            root.focusLock();
        }
    }

    GlobalShortcut {
        name: "lock"
        description: "Locks the screen"
        onPressed: root.lock()
    }
    GlobalShortcut {
        name: "lockFocus"
        description: "Re-focuses the lock screen after wake (Hyprland unfocus workaround)"
        onPressed: root.focusLock()
    }
}
```

- [ ] **Step 2: Lint**

Run: `qmllint widgets/lock/LockScreen.qml`
Expected: PASS (no output, exit 0).

- [ ] **Step 3: Commit**

```bash
git add widgets/lock/LockScreen.qml
git commit -m "feat(lock): add LockScreen scope with WlSessionLock and IPC"
```

---

### Task 4: Wire into shell + IPC compat

**Files:**
- Modify: `shell.qml` (remove `qs.widgets.userPanel` import + UserPanel Variants block lines ~10 and ~72-82; add lock import + scope).
- Modify: `services/Ipc.qml` (`togglePanel`, ~line 220: add user-panel compat branch before the Registry lookup).

**Interfaces:**
- Consumes: Task 3 Registry `"lock-screen"` handle (`lock()` function).
- Produces: lock active on shell start (unlocked state), `qs ipc call lock activate` path, old `togglePanel user-panel <mon>` bindings keep locking.

- [ ] **Step 1: Edit shell.qml imports**

Replace `import qs.widgets.userPanel` with `import qs.widgets.lock`. The import block becomes:

```qml
import qs.services
import qs.widgets.bar
import qs.widgets.launcher
import qs.widgets.lock
import qs.widgets.media
import qs.widgets.notifications
```

- [ ] **Step 2: Replace the UserPanel window with the lock scope**

Replace the whole block:

```qml
    // per-monitor user panel (full-screen power grid overlay)
    Variants {
        model: Quickshell.screens

        UserPanel {
            required property ShellScreen modelData

            screen: modelData
        }

    }
```

with:

```qml
    // Secure lockscreen (replaces the UserPanel overlay): single scope,
    // the compositor instantiates one WlSessionLockSurface per screen.
    LockScreen {
    }
```

- [ ] **Step 3: Add user-panel compat to Ipc.togglePanel**

In `services/Ipc.qml`, inside `togglePanel(name, monitor)`, before the
`const key = ...` Registry lookup, insert exactly:

```qml
            // UserPanel was replaced by the secure lock — keep old
            // SUPER+bindings (`togglePanel user-panel <mon>`) locking.
            if (name === "user-panel" || name === "userPanel") {
                const l = Registry.get("lock-screen");
                if (l) {
                    l.lock();
                    return "lock activated (user-panel compat)";
                }
                return "lock-screen not ready";
            }
```

- [ ] **Step 4: Lint the edited files**

Run: `qmllint shell.qml services/Ipc.qml widgets/lock/qmldir`
Expected: PASS (no output, exit 0). If qmllint flags the qmldir (non-QML), re-run with just the two QML files and note it.

- [ ] **Step 5: Commit**

```bash
git add shell.qml services/Ipc.qml
git commit -m "feat(lock): wire LockScreen into shell with user-panel compat"
```

---

### Task 5: Delete UserPanel + verify end to end

**Files:**
- Delete: `widgets/userPanel/UserPanel.qml`, `widgets/userPanel/qmldir` (and the directory if empty).

**Interfaces:**
- Consumes: all prior tasks. Verifies no remaining references to `userPanel`/`UserPanel`/`user-panel-` except the compat branch and docs.

- [ ] **Step 1: Delete the UserPanel files**

```bash
git rm widgets/userPanel/UserPanel.qml widgets/userPanel/qmldir
```

- [ ] **Step 2: Confirm no stale references**

Run: `rg -n "userPanel|UserPanel|user-panel-" --glob '!docs/**' .`
Expected: only `services/Ipc.qml` compat branch lines match. If `shell.qml` or any other QML file still references it, fix before proceeding.

- [ ] **Step 3: Reload the shell and lock via IPC**

Run: `qs -p "$HOME/.config/quickshell/archeclipse" ipc call lock activate`
Expected: all monitors show the dimmed lock card with lock icon + password field + 4 buttons; `qs -p "$HOME/.config/quickshell/archeclipse" ipc call lock focus` keeps focus in the password field.

- [ ] **Step 4: Auth + actions smoke test**

Type a wrong password + Enter: error text + shake appear, session stays locked. Type the correct password + Enter: all monitors unlock. Click each of the 4 buttons (logout/shutdown/sleep/reboot) only if safe in your session — at minimum hover each and confirm the tooltip, and confirm sleep leaves the quickshell lock engaged under hyprlock. Press Esc in the password field: text clears.

- [ ] **Step 5: Commit the deletion**

```bash
git commit -m "feat(lock)!: remove UserPanel, replaced by secure lockscreen"
```

(Test Steps 3–4 require a live Hyprland session; if headless, run Steps 1–2 plus lint from Task 4 and note the live check as pending in the commit message body.)

---

## Self-Review

**1. Spec coverage:** architecture (Task 3 scope + Task 4 shell swap) ✓; components LockContext/LockSurface/LockScreen + qmldir (Tasks 1–3) ✓; shell/IPC/deletion file list (Tasks 4–5) ✓; BarState untouched ✓; data flow lock → PAM → unlock/failure (Tasks 1–3 wiring) ✓; error handling incl. empty-password guard, onError-as-failure, unlock-before-quit comment, 10s clear (Task 1 + Task 3) ✓; no fingerprint/keyring/wallpaper-blur/pill-state (not in any task) ✓; testing via qmllint + rg + live IPC/auth/actions (Tasks 2, 4, 5) ✓; sleep double-lock documented (Task 2 handler + Task 5 check) ✓.

**2. Placeholder scan:** no TBD/TODO/later/fill-in; every code step ships exact file content; commands pin exact paths and expected outputs; AppButton/Hyprland/Quickshell APIs match existing repo usage (LeftIsland AppButton props, UserPanel action commands, Bar.qml Hyprland import pattern).

**3. Type consistency:** context API spelled identically across tasks (`screenLocked`, `currentText`, `unlockInProgress`, `showFailure`, `screenUnlockFailed`, `shouldReFocus/unlocked/failed`, `clearText/reset/resetClearTimer/tryUnlock`); LockScreen exposes `lock()`/`focusLock()` and Task 4 calls `l.lock()`; IPC target `"lock"` with `activate()`/`focus()` matches Task 5 commands.
