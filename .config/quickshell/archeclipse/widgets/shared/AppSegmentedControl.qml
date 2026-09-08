// Shared animated segmented control: single-select pill group with a
// sliding highlight (e.g. wallpaper switcher's workspace/sddm/lockscreen
// target type). Single highlight Rectangle animates x/width — one moving
// part, not per-button fades, so selection visibly slides.
//
//   model        -> [string] or [{value,label[,icon,tooltip,enabled]}].
//                 Strings use the string as both value and label and are
//                 always enabled; object entries may set enabled: false
//                 (e.g. a tab whose content isn't available yet).
//   currentIndex -> selected index (caller-driven, ComboBox-style).
//   activated(i, value) -> emitted on user pick (including re-clicks on
//                 the current cell, mirroring the old toggle buttons whose
//                 onClicked re-ran e.g. refetch — caller writes its state;
//                 re-assigning the same value is a harmless no-op).
//   enabled      -> Item.enabled dims the whole control and blocks input;
//                 per-item disabled cells dim individually.
//
// Example:
//   AppSegmentedControl {
//       model: root.targetTypes
//       currentIndex: root.targetTypes.indexOf(root.targetType)
//       onActivated: (i, v) => root.targetType = v
//   }
import QtQuick
import QtQuick.Controls
import qs.theme

Item {
    id: root

    property var model: []
    property int currentIndex: 0
    readonly property int count: root.model?.length ?? 0
    readonly property var currentValue: valueAt(root.currentIndex)

    property int pixelSize: 12
    property string fontFamily: Theme.fontFamily
    property int cornerRadius: 8
    property int cellHPadding: 14
    property int cellVPadding: 8
    property int highlightMargin: 2
    property int animationDuration: 200

    signal activated(int index, var value)

    function valueAt(i) {
        if (!root.model || i < 0 || i >= root.model.length)
            return undefined;
        const e = root.model[i];
        if (typeof e === "string")
            return e;
        return e?.value ?? e?.display ?? e?.name ?? e;
    }
    function labelAt(i) {
        if (!root.model || i < 0 || i >= root.model.length)
            return "";
        const e = root.model[i];
        if (typeof e === "string")
            return e;
        return e?.label ?? e?.display ?? e?.name ?? String(e?.value ?? "");
    }
    function iconAt(i) {
        if (!root.model || i < 0 || i >= root.model.length)
            return "";
        const e = root.model[i];
        if (typeof e === "string")
            return "";
        return e?.icon ?? "";
    }
    function tooltipAt(i) {
        if (!root.model || i < 0 || i >= root.model.length)
            return "";
        const e = root.model[i];
        if (typeof e === "string")
            return "";
        return e?.tooltip ?? e?.tooltipText ?? "";
    }
    function enabledAt(i) {
        if (!root.model || i < 0 || i >= root.model.length)
            return false;
        const e = root.model[i];
        if (typeof e === "string")
            return true;
        return e?.enabled ?? true;
    }

    // Arrow-key navigation between segments.
    Keys.onLeftPressed: e => moveSelection(-1, e)
    Keys.onRightPressed: e => moveSelection(1, e)
    function moveSelection(delta, e) {
        if (!root.enabled || root.count === 0)
            return;
        // Skip disabled cells; stop at the ends.
        let next = root.currentIndex + delta;
        while (next >= 0 && next < root.count && !root.enabledAt(next))
            next += delta;
        if (next < 0 || next >= root.count || next === root.currentIndex)
            return;
        root.activated(next, root.valueAt(next));
        if (e)
            e.accepted = true;
    }

    implicitWidth: bg.implicitWidth
    implicitHeight: bg.implicitHeight
    activeFocusOnTab: true

    Rectangle {
        id: bg
        anchors.fill: parent
        implicitWidth: row.implicitWidth + root.highlightMargin * 2
        implicitHeight: row.implicitHeight + root.highlightMargin * 2
        radius: root.cornerRadius + 2
        color: Theme.bg
        border.width: 1
        border.color: Theme.border
        opacity: root.enabled ? 1 : 0.4

        // Sliding selection pill — the only animated chrome.
        Rectangle {
            id: highlight
            visible: root.currentIndex >= 0 && root.currentIndex < repeater.count
            y: root.highlightMargin
            height: parent.height - root.highlightMargin * 2
            radius: root.cornerRadius
            color: Theme.surfaceActive
            border.width: 1
            border.color: Theme.accent
            Behavior on x {
                NumberAnimation {
                    duration: root.animationDuration
                    easing.type: Easing.OutCubic
                }
            }
            Behavior on width {
                NumberAnimation {
                    duration: root.animationDuration
                    easing.type: Easing.OutCubic
                }
            }
        }

        Row {
            id: row
            x: root.highlightMargin
            y: root.highlightMargin
            height: parent.height - root.highlightMargin * 2
            spacing: 2

            Repeater {
                id: repeater
                model: root.model
                delegate: Item {
                    id: cell
                    required property var modelData
                    required property int index
                    readonly property bool selected: root.currentIndex === index
                    readonly property string label: root.labelAt(index)
                    readonly property string icon: root.iconAt(index)
                    // NOTE: named cellEnabled — Item.enabled already exists.
                    readonly property bool cellEnabled: root.enabledAt(index)
                    readonly property bool dimmed: !cell.cellEnabled || !root.enabled

                    implicitWidth: cellRow.implicitWidth + root.cellHPadding * 2
                    implicitHeight: cellRow.implicitHeight + root.cellVPadding * 2
                    width: implicitWidth
                    // Full-row click area. NOTE: must NOT bind to
                    // row.height — a child's geometry feeding back into
                    // the positioner's own geometry makes the Row report
                    // 0 implicit size (control collapses to just margins).
                    height: implicitHeight

                    ToolTip.visible: cellMa.containsMouse && root.tooltipAt(index) !== ""
                    ToolTip.text: root.tooltipAt(index)
                    ToolTip.delay: 600

                    Row {
                        id: cellRow
                        anchors.centerIn: parent
                        spacing: 6
                        Text {
                            visible: cell.icon !== ""
                            text: cell.icon
                            font.pixelSize: root.pixelSize
                            font.family: "JetBrainsMono NFP"
                            verticalAlignment: Text.AlignVCenter
                            color: cell.dimmed ? Theme.muted : (cell.selected ? Theme.accent : (cellMa.containsMouse ? Theme.fg : Theme.muted))
                            opacity: cell.dimmed ? 0.5 : 1
                            Behavior on color {
                                ColorAnimation {
                                    duration: 150
                                }
                            }
                        }
                        Text {
                            text: cell.label
                            font.pixelSize: root.pixelSize
                            font.family: root.fontFamily
                            verticalAlignment: Text.AlignVCenter
                            color: cell.dimmed ? Theme.muted : (cell.selected ? Theme.accent : (cellMa.containsMouse ? Theme.fg : Theme.muted))
                            opacity: cell.dimmed ? 0.5 : 1
                            Behavior on color {
                                ColorAnimation {
                                    duration: 150
                                }
                            }
                        }
                    }

                    MouseArea {
                        id: cellMa
                        anchors.fill: parent
                        hoverEnabled: true
                        enabled: cell.cellEnabled
                        cursorShape: cell.cellEnabled ? Qt.PointingHandCursor : Qt.ArrowCursor
                        onClicked: {
                            root.forceActiveFocus();
                            root.activated(cell.index, root.valueAt(cell.index));
                        }
                    }
                }
            }
        }
    }

    function syncHighlight() {
        const cell = repeater.itemAt(root.currentIndex);
        if (!cell) {
            highlight.width = 0;
            return;
        }
        // cell.x is relative to row; row sits at highlightMargin inside bg.
        highlight.x = row.x + cell.x;
        highlight.width = cell.width;
    }

    onCurrentIndexChanged: Qt.callLater(syncHighlight)
    onModelChanged: Qt.callLater(syncHighlight)
    Component.onCompleted: Qt.callLater(syncHighlight)
    // Re-sync after layout settles (delegate widths resolve a frame after
    // model/currentIndex changes, so defer past the Row's own layout).
    Connections {
        target: row
        function onImplicitWidthChanged() {
            Qt.callLater(root.syncHighlight);
        }
    }
}
