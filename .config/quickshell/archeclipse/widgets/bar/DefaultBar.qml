import QtQuick
import qs.theme
import qs.services
import qs.widgets.bar

// Port of barStates/DefaultBar.tsx — centerbox: workspaces | information | utilities.
// All sections always show (the bar-layout setting was removed).
Row {
    id: root
    spacing: Theme.sectionSpacing

    Item {
        width: childrenRect.width
        height: 24
        Workspaces { height: 24 }
    }
    Information {
        anchors.verticalCenter: parent.verticalCenter
    }
    Row {
        id: utilities
        spacing: Theme.spacing

        Battery {}
        Brightness {}
        Volume {}
        Tray {}
        ResourceMonitor {}
        ControlPanelButton {}
    }
}
