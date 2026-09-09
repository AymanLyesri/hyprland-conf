import QtQuick
import qs.theme
import qs.services

// Compact bar button with icon + temp on a weather-code-colored background.
// Hover/click pulses the full weather island (BarState "weather").
Rectangle {
    id: root
    height: 22
    width: content.implicitWidth + 14
    radius: Theme.radius
    // color set by weatherBg binding below

    // Reactive weather data
    readonly property var wx: Weather.data
    readonly property var cur: wx ? (wx.current ?? {}) : ({})
    readonly property var cu: wx ? (wx.current_units ?? {}) : ({})
    readonly property bool hasData: wx !== null

    // Dynamic background color based on weather code (matches AGS CSS)
    readonly property string weatherBg: hasData ? Weather.background(cur.weather_code) : "transparent"
    color: hover.hovered ? (hasData ? root.weatherBg : Theme.surfaceHover) : (hasData ? root.weatherBg : "transparent")

    Behavior on color { ColorAnimation { duration: 200 } }

    Row {
        id: content
        anchors.centerIn: parent
        spacing: 6

        // Weather icon
        Text {
            visible: root.hasData
            anchors.verticalCenter: parent.verticalCenter
            text: Weather.icon(root.cur.weather_code)
            color: "white"
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize + 1
        }

        // Temp + description (ellided, capped so it can't stretch the bar)
        Text {
            visible: root.hasData
            anchors.verticalCenter: parent.verticalCenter
            text: {
                if (!root.hasData) return "";
                const t = Math.round(root.cur.temperature_2m ?? 0);
                const unit = root.cu.temperature_2m || "°C";
                const desc = Weather.description(root.cur.weather_code);
                return `${t}${unit} ${desc}`;
            }
            elide: Text.ElideRight
            width: Math.min(implicitWidth, 120)
            color: "white"
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSize
        }
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: BarState.activate("weather", 3000)
    }

    HoverHandler {
        id: hover
        onHoveredChanged: {
            if (hover.hovered)
                BarState.activate("weather", 3000);
        }
    }
}
