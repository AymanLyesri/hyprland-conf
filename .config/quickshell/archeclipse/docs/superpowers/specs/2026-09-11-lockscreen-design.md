# Lockscreen island (UserPanel replacement) — design spec

Date: 2026-09-11
Status: approved design, awaiting spec review
Path classification: architectural (new secure subsystem replacing an existing window)

## Context

`widgets/userPanel/UserPanel.qml` is a per-monitor `PanelWindow` full-screen
overlay (dim `rgba(0,0,0,0.2)`, 2x2 power grid + `UserProfileWidget` minimal
pill), registered as `user-panel-<monitor>` and toggled via
`Ipc.togglePanel`. A `PanelWindow` overlay is NOT a secure lock: it can be
bypassed (VT switch, layer competition, shell crash exposes the session).

Reference: end-4/dots-hyprland lock module + official quickshell lockscreen
example. Security comes from `ext-session-lock-v1` (`WlSessionLock`), auth
from `Quickshell.Services.Pam` (`PamContext`), focus resilience from a
`shouldReFocus` signal + shortcuts.

## Decisions (user-approved)

- Real secure lock (WlSessionLock + PAM), not a visual reskin.
- Four actions run DIRECTLY (no password gate): logout, shutdown,
  sleep (`systemctl suspend`, lock stays engaged), reboot.
- Full replace: remove `UserPanel` Variants from `shell.qml`, single
  `LockScreen` scope; keep `togglePanel user-panel <mon>` compat routing to
  lock.
- Background: transparent `WlSessionLockSurface` + fullscreen dim so Hyprland
  compositor blur shows through (no in-QML wallpaper blur).
- Approach A (end-4 faithful port). B/C rejected.

## Architecture

Single `LockScreen` scope instantiated once in `shell.qml` (replaces the
`Variants { model: Quickshell.screens; UserPanel {} }` block). `WlSessionLock
{ locked: <shared bool>; surface: per-screen surface }` — the compositor
instantiates one `WlSessionLockSurface` per screen automatically, so no
`Variants` is needed. Input blocking is compositor-enforced; `secure === true`
once all screens are covered. Shell crash / destroy without unlock leaves the
compositor fallback lock (inoperable, not exposed) — by design.

## Components (new `widgets/lock/` module `qs.widgets.lock`)

- `LockContext.qml` (Scope, shared across screens): `screenLocked`,
  `bgPaths` (monitorName → grim screenshot path, captured pre-lock),
  `currentText`, `unlockInProgress`, `showFailure`, `screenUnlockFailed`;
  `signal shouldReFocus()`, `signal unlocked()`, `signal failed()`; 10s
  auto-clear timer (restarted on typing/focus events, fires `reset()`);
  `tryUnlock()` guards empty text, sets `unlockInProgress`, `pam.start()`;
  `reset()` clears text/flags; `PamContext` on default `login` stack
  (`/etc/pam.d`, no custom dir): `onPamMessage` responds only when
  `responseRequired`, `onCompleted` success → clear + `unlocked()`,
  failure/error → clear + `showFailure=true`, `unlockInProgress=false`.
  No fingerprint in v1, no debug bypass.
- `LockSurface.qml` (per-screen, inside `WlSessionLockSurface`):
  fullscreen `MouseArea` (transparent; click/position-change force password
  focus); background is a per-monitor grim screenshot (captured just before
  locking, since Hyprland blanks behind session-lock surfaces) shown blurred
  via `MultiEffect` + light scrim, with the plain dim rect as fallback;
  top-center frosted island (`Theme.surface` fill — Hyprland blurs behind it):
  lock glyph ``,
  username row, `AppTextField` password (`echoMode: Password`,
  `ImhSensitiveData`, Enter-to-unlock with no confirm button),
  error label + shake animation on `showFailure`, "Locked" label, 1x4 Row of
  direct action buttons reusing UserPanel glyphs/tooltips/handlers.
- `LockScreen.qml` (Scope): owns `LockContext`; screenshot-then-lock
  (`grim -o <mon>` per monitor in parallel, 2s safety timeout, dim fallback)
  before setting `screenLocked`; `WlSessionLock`
  (`locked: context.screenLocked`); `onUnlocked` → `screenLocked=false`
  (unlock before anything else); `IpcHandler target "lock"`
  (`activate()` locks + resets, `focus()` emits `shouldReFocus`);
  `GlobalShortcut` `lock` + `lockFocus` (Hyprland wake unfocus workaround).
- `qmldir`: `module qs.widgets.lock`.

## Files touched

- ADD `widgets/lock/{qmldir,LockContext.qml,LockSurface.qml,LockScreen.qml}`,
  `docs/superpowers/specs/2026-09-11-lockscreen-design.md` (this file).
- EDIT `shell.qml` (drop `qs.widgets.userPanel` import + `UserPanel` Variants,
  add lock scope), `services/Ipc.qml` (`togglePanel user-panel*` → lock
  activate for compat).
- DELETE `widgets/userPanel/UserPanel.qml` + qmldir (complete the replace).
- NOT touched: `BarState` (no new pill state), `Theme`, compositor config
  (blur already enabled).

## Data flow

lock (`activate`/shortcut) → `context.reset()` → per-monitor grim shots →
  `screenLocked=true` (or dim fallback on shot failure/timeout) → surfaces
  appear on all screens, password focused. Typing sets `currentText`,
clears failure, restarts 10s timer. Enter/confirm → `tryUnlock()` →
`PamContext.start()` → `respond(currentText)` → success: clear text,
`screenLocked=false`; failure: clear text, show error + shake, stay locked.
Power buttons execute directly (`Hyprland.dispatch("hl.dsp.exit")`,
`shutdown now`, `systemctl suspend`, `reboot`) without touching lock state:
sleep keeps `screenLocked=true`, so wake shows this lock directly.

## Error handling

Empty password never starts PAM. Grace period: Esc with an empty field
dismisses without a password within 30s of locking (`lockedAt` set at
engage); Esc during an in-flight PAM attempt is ignored. PAM error signal treated as failure (clear,
flag, stay locked). Password text cleared on success, failure, lock, and
10s idle. `unlockInProgress` disables input + confirm while authenticating.
Never quit/restart the shell while `locked=true` without unlocking first.
Operator rule: never quit/restart/reload the shell while locked without
unlocking first — the compositor shows an uninteractable fallback lock otherwise.

## Testing

`qs ipc call lock activate`; wrong password → error + shake, still locked;
correct password → unlock all monitors; each monitor covered; 4 action
buttons; Esc clears; 10s idle clears; `lockFocus` refocuses after wake;
`togglePanel user-panel eDP-1` still locks; `qmllint` on new files.

## Out of scope (v1)

Fingerprint/fprintd, password-gated power actions, keyring unlock,
wallpaper-blur fallback, per-monitor lock state, BarState pill state.
