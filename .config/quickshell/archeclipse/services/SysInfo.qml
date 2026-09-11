pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io

// System resources for the bar's resource monitor.
// Reuses the exact loop binaries the AGS bar feeds on (no extra polling):
//   /tmp/ags-$USER/system-resources-loop-ags  -> JSON {cpuLoad, ramUsedGB, ramTotalGB, gpus:[{driver,load}]}
//   /tmp/ags-$USER/bandwidth-loop-ags         -> JSON [upPkts, downPkts, upBytes, downBytes]
// The binaries are compiled from the AGS C sources at startup so Quickshell
// works standalone (does not depend on AGS having been started first).
QtObject {
    id: root

    property var systemResources: null
    property var bandwidth: [0, 0, 0, 0]

    property string tmpDir: `/tmp/ags-${Quickshell.env("USER")}`
    property string scriptsDir: `${Quickshell.env("HOME")}/.config/ags/scripts`

    property var resProcObj: null
    property var bwProcObj: null

    // Compile both loop binaries. gcc is fast; unconditional compile is fine.
    // mkdir -p first: /tmp is wiped on every reboot, without it `ld` fails with
    // "cannot open output file" and the loops never start (retry would loop forever).
    property Process compileProc: Process {
        command: [
            "bash", "-c",
            "mkdir -p " + root.tmpDir
            + " && gcc -o " + root.tmpDir + "/system-resources-loop-ags " + root.scriptsDir + "/system-resources-loop-ags.c -lm"
            + " && gcc -o " + root.tmpDir + "/bandwidth-loop-ags " + root.scriptsDir + "/bandwidth-loop-ags.c -lm"
        ]
        stdout: SplitParser {
            splitMarker: "\n"
            onRead: data => console.log("[SysInfo] compile: " + data)
        }
        stderr: SplitParser {
            splitMarker: "\n"
            onRead: data => console.warn("[SysInfo] compile stderr: " + data)
        }
        onExited: (exitCode, exitStatus) => {
            if (exitCode === 0) {
                console.log("[SysInfo] loop binaries compiled");
                retryTimer.stop();
                startLoops();
            } else {
                console.warn("[SysInfo] compilation failed, exitCode=" + exitCode + " — retrying");
                // Retry after a delay (handles source missing, gcc missing, etc.)
                if (!retryTimer.running)
                    retryTimer.start();
            }
        }
    }

    property Timer retryTimer: Timer {
        interval: 10000
        repeat: true
        triggeredOnStart: false
        onTriggered: {
            if (!compileProc.running)
                compileProc.running = true;
        }
    }

    // Backoff restarts for the loops: an immediate `running = true` on exit
    // spin-loops at 100% CPU when the binary is missing/crashing (e.g.
    // bandwidth-loop exits(1) with no default route). 2s delay + running
    // guard keeps one instance alive without hammering.
    property Timer resRestartTimer: Timer {
        interval: 2000
        repeat: false
        onTriggered: {
            if (root.resProcObj && !root.resProcObj.running)
                root.resProcObj.running = true;
        }
    }
    property Timer bwRestartTimer: Timer {
        interval: 2000
        repeat: false
        onTriggered: {
            if (root.bwProcObj && !root.bwProcObj.running)
                root.bwProcObj.running = true;
        }
    }

    function startLoops() {
        // Tear down previous instances + pending restarts so recompile
        // (or a manual retry) never leaves duplicate loop processes.
        resRestartTimer.stop();
        bwRestartTimer.stop();
        // system resources loop
        if (root.resProcObj) root.resProcObj.destroy();
        root.resProcObj = Qt.createQmlObject(`
            import Quickshell.Io; import QtQuick;
            Process {
                command: ["${root.tmpDir}/system-resources-loop-ags"]
                stdout: SplitParser {
                    splitMarker: "\\n"
                    onRead: data => {
                        try { root.systemResources = JSON.parse(data); }
                        catch (e) { root.systemResources = null; }
                    }
                }
                stderr: SplitParser {
                    splitMarker: "\\n"
                    onRead: data => console.warn("[SysInfo] res-loop stderr: " + data)
                }
                onExited: (code, status) => {
                    console.warn("[SysInfo] res-loop exited code=" + code + " — restarting in 2s");
                    root.resRestartTimer.start();
                }
                Component.onCompleted: running = true
            }`, root);

        // bandwidth loop
        if (root.bwProcObj) root.bwProcObj.destroy();
        root.bwProcObj = Qt.createQmlObject(`
            import Quickshell.Io; import QtQuick;
            Process {
                command: ["${root.tmpDir}/bandwidth-loop-ags"]
                stdout: SplitParser {
                    splitMarker: "\\n"
                    onRead: data => {
                        try {
                            const p = JSON.parse(data);
                            const kb = v => Math.round(v / 1024);
                            root.bandwidth = [kb(p[0]), kb(p[1]), kb(p[2]), kb(p[3])];
                        } catch (e) { root.bandwidth = [0, 0, 0, 0]; }
                    }
                }
                stderr: SplitParser {
                    splitMarker: "\\n"
                    onRead: data => console.warn("[SysInfo] bw-loop stderr: " + data)
                }
                onExited: (code, status) => {
                    console.warn("[SysInfo] bw-loop exited code=" + code + " — restarting in 2s");
                    root.bwRestartTimer.start();
                }
                Component.onCompleted: running = true
            }`, root);
    }

    Component.onCompleted: {
        compileProc.running = true;
    }
}