import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Quickshell
import Quickshell.Io
import qs.theme
import qs.widgets.shared
import qs.services
import qs.widgets.bar

// Donations widget — full port of Donations.tsx (+ embeds General.tsx via GeneralTab)
// Third-party: open URL in browser (xdg-open)
// Crypto: copy address to clipboard (wl-copy) + show QR code (qrencode)
Item {
    id: root
    property int widgetWidth: parent.width
    property string className: ""

    property var donationOptions: [
        { name: "Ko-fi", icon: "\u{F0C4}", type: "third-party", class: "kofi", url: "https://ko-fi.com/aymanlyesri", color: "#29ABE0" },
        { name: "PayPal", icon: "\u{F1ED}", type: "third-party", class: "paypal", url: "https://paypal.me/LyesriAyman", color: "#00457C" },
        { name: "Bitcoin", icon: "\u{F15A}", type: "crypto", address: "1JisW9xeatCFadtgsenjbpCcFePZGPyXow", color: "#F7931A" },
        { name: "Ethereum", icon: "\u{F27E}", type: "crypto", address: "0x52d06d47bb9dc75eaf027f18cb197d5817989a96", color: "#627EEA" },
        { name: "BSC (BEP20)", icon: "\u{F27E}", type: "crypto", description: "BNB Smart Chain", address: "0x52d06d47bb9dc75eaf027f18cb197d5817989a96", color: "#F3BA2F" }
    ]

    // Scrolled window wrapper (AGS <scrolledwindow hexpand vexpand>)
    SmoothFlickable {
        id: donateScroll
        anchors.fill: parent
        clip: true
        contentWidth: width
        contentHeight: donateCol.implicitHeight
        ScrollBar.vertical: ScrollBar {
            policy: ScrollBar.AsNeeded
        }

        Column {
            id: donateCol
            width: donateScroll.width
            spacing: 16
            topPadding: 4

            // General info section (avatar, version, links, stars) — AGS embeds General().
            // NOTE: explicit height — GeneralTab's root is a bare Item with
            // no auto-size, which would collapse to 0 inside this Column.
            GeneralTab {
                id: generalEmbed
                width: parent.width
                height: generalEmbed.implicitHeight
                widgetWidth: parent.width
            }

            // Separator
            Rectangle { width: parent.width; height: 1; color: Theme.border }

            // Header (full width so labels can wrap + center)
            Column {
                width: parent.width
                spacing: 5

                Label {
                    width: parent.width
                    text: "Support the Project"
                    font.pixelSize: Theme.fontSize + 4
                    font.bold: true
                    color: Theme.fg
                    horizontalAlignment: Text.AlignHCenter
                    wrapMode: Text.WordWrap
                }

                Label {
                    width: parent.width
                    text: "Your donations help keep this project alive"
                    font.pixelSize: Theme.fontSize
                    color: Theme.fgDim
                    horizontalAlignment: Text.AlignHCenter
                    wrapMode: Text.WordWrap
                }
            }

        // Donation options — masonry grid (2 columns). AppButton is a
        // bare Item: it needs explicit height + icon/text, otherwise it
        // collapses to height 0 with a transparent background (the old
        // bug — invisible buttons).
        AppMasonry {
            width: parent.width
            columns: 2
            spacing: 10
            model: root.donationOptions

            delegate: Item {
                property var modelData
                // Guarded shortcut: Loader creates the delegate with
                // modelData undefined, then AppMasonry pushes it in
                // onLoaded — every access must tolerate undefined.
                property var opt: modelData ?? ({})
                property string addr: opt.address ?? ""
                property string url: opt.url ?? ""
                property string qrData: opt.address ?? opt.url ?? ""
                property color brandColor: opt.color ?? Theme.accent

                width: parent.width
                height: cardCol.implicitHeight

                Column {
                    id: cardCol
                    width: parent.width
                    spacing: 6

                    // Main action button (brand color border, fills with
                    // the brand color on hover)
                    AppButton {
                        width: parent.width
                        height: 46
                        icon: opt.icon ?? ""
                        text: opt.name ?? ""
                        pixelSize: Theme.fontSize
                        outlined: true
                        outlineColor: brandColor
                        idleBg: Theme.surface
                        hoverBg: brandColor
                        idleFg: Theme.fg
                        hoverFg: "white"
                        tooltipText: opt.type === "crypto" && addr
                            ? "Copy " + opt.name + " address\n" + addr
                            : "Donate via " + opt.name + "\n" + url
                        onClicked: {
                            if (opt.type === "crypto" && addr) {
                                copyToClipboard(addr, opt.name)
                            } else if (url) {
                                openUrl(url)
                            }
                        }
                    }

                    // Optional subtitle (e.g. "BNB Smart Chain") + address hint
                    Label {
                        visible: (opt.description ?? "") !== ""
                        width: parent.width
                        text: opt.description ?? ""
                        font.pixelSize: Theme.fontSize - 3
                        color: Theme.fgDim
                        horizontalAlignment: Text.AlignHCenter
                        wrapMode: Text.WordWrap
                    }

                    // QR Code button
                    AppButton {
                        width: parent.width
                        height: 32
                        icon: "\u{F029}"
                        text: "QR"
                        pixelSize: Theme.fontSize - 2
                        outlined: true
                        outlineColor: Theme.border
                        idleBg: "transparent"
                        hoverBg: Theme.surfaceActive
                        tooltipText: "Show QR Code"
                        onClicked: {
                            if (qrData) showQRCode(qrData, opt.name)
                        }
                    }
                }
            }
        }

        // Footer (full width so the label can center)
        Column {
            width: parent.width
            spacing: 8
            Label {
                width: parent.width
                text: "Thank you for your support! \u{1F496}"
                font.pixelSize: Theme.fontSize + 1
                font.bold: true
                color: Theme.accent
                wrapMode: Text.WordWrap
                horizontalAlignment: Text.AlignHCenter
            }
        }
    }

    // --- Helpers ---
    function copyToClipboard(text, label) {
        const proc = copyProcComp.createObject(root)
        proc.label = label
        proc.command = ["bash", "-c", "echo -n " + JSON.stringify(text) + " | wl-copy"]
        proc.running = true
    }

    property Component copyProcComp: Component {
        Process {
            property string label: ""
            onExited: (code) => {
                if (code === 0) {
                    Notifications.notify({ summary: "Copied to Clipboard", body: label + " address copied successfully!" })
                } else {
                    Notifications.notify({ summary: "Error", body: "Failed to copy to clipboard" })
                }
            }
        }
    }

    function openUrl(url) {
        const proc = openProcComp.createObject(root)
        proc.command = ["xdg-open", url]
        proc.name = url.split("/").pop() || "link"
        proc.running = true
    }

    property Component openProcComp: Component {
        Process {
            property string name: ""
            command: ["xdg-open", ""]
            onExited: (code) => {
                if (code === 0) Notifications.notify({ summary: "Opening page", body: "Opening donation page in browser..." })
                else Notifications.notify({ summary: "Error", body: "Failed to open URL" })
            }
        }
    }

    function showQRCode(data, name) {
        const qrPath = "/tmp/donation_qr_" + name.toLowerCase().replace(/\s+/g, "_") + ".png"
        const proc = qrProcComp.createObject(root)
        proc.command = ["qrencode", "-o", qrPath, data]
        proc.running = true
        proc.qrPath = qrPath
        proc.name = name
    }

    property Component qrProcComp: Component {
        Process {
            property string qrPath: ""
            property string name: ""
            onExited: (code) => {
                if (code === 0) {
                    // Open QR image with first available viewer
                    const viewer = Qt.createQmlObject('import Quickshell.Io; Process { command: ["swayimg", qrPath] }', root)
                    viewer.running = true
                    viewer.onExited = (c) => {
                        if (c !== 0) {
                            const v2 = Qt.createQmlObject('import Quickshell.Io; Process { command: ["eog", qrPath] }', root)
                            v2.running = true
                            v2.onExited = (c2) => {
                                if (c2 !== 0) {
                                    // AGS Donations.tsx:113 tries gwenview
                                    // before xdg-open — keep the full chain.
                                    const v25 = Qt.createQmlObject('import Quickshell.Io; Process { command: ["gwenview", qrPath] }', root)
                                    v25.running = true
                                    v25.onExited = (c25) => {
                                        if (c25 !== 0) {
                                            const v3 = Qt.createQmlObject('import Quickshell.Io; Process { command: ["xdg-open", qrPath] }', root)
                                            v3.running = true
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Notifications.notify({ summary: "QR Code Generated", body: "Scan the QR code to get " + name + " address!" })
                } else {
                    Notifications.notify({ summary: "Error", body: "QR code generation failed. Install 'qrencode' package." })
                }
            }
        }
    }
}
}