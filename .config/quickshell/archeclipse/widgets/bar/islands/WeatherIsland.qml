import QtQuick
import QtQuick.Controls
import qs.theme
import qs.services
import qs.widgets.shared

// Weather island — shown when the bar weather button is hovered/clicked.
// Layout mirrors the AGS Weather widget (main column: icon/city/temp/
// description/feels-like/date; side column: sun, humidity/precip, wind;
// city search; Today's + Hourly forecast) in the current Quickshell
// card styling (code-colored header, Theme.surface forecast cards).
Item {
    id: root
    property int islandMargins: 5
    property int islandWidth: 460

    readonly property var wx: Weather.data
    readonly property var cur: wx ? (wx.current ?? {}) : ({})
    readonly property var day: wx ? (wx.daily ?? {}) : ({})
    readonly property var hour: wx ? (wx.hourly ?? {}) : ({})
    readonly property var cu: wx ? (wx.current_units ?? {}) : ({})
    readonly property bool hasData: wx !== null
    readonly property string tempUnit: cu.temperature_2m || "°C"
    readonly property string windUnit: cu.wind_speed_10m || "km/h"
    readonly property string codeBg: hasData ? Weather.background(cur.weather_code) : Theme.surface

    property string savedCity: ""
    property bool _entryDirty: false

    implicitWidth: islandWidth + islandMargins * 2
    implicitHeight: content.height + islandMargins * 2
    width: implicitWidth
    height: implicitHeight

    function fmt(v, unit) {
        return v != null && v !== "" ? `${Math.round(v)}${unit}` : "N/A";
    }
    function fmtRaw(v, unit) {
        return v != null && v !== "" ? `${v}${unit}` : "N/A";
    }
    function formatTime(iso) {
        if (!iso)
            return "N/A";
        const s = String(iso).replace("T", " ").replace(/-/g, "/");
        const d = new Date(s);
        if (isNaN(d.getTime()))
            return "N/A";
        return d.toLocaleTimeString(Qt.locale(), "HH:mm");
    }
    function formatDate(iso) {
        if (!iso)
            return "N/A";
        const s = String(iso).replace("T", " ").replace(/-/g, "/");
        const d = new Date(s);
        if (isNaN(d.getTime()))
            return "N/A";
        return d.toLocaleDateString(Qt.locale(), "ddd d MMM");
    }
    function hourlyItems() {
        const h = root.hour;
        if (!h || !h.time || h.time.length === 0)
            return [];
        const curTime = root.cur.time;
        let currentHourISO;
        if (curTime) {
            currentHourISO = String(curTime).slice(0, 13) + ":00";
        } else {
            const now = new Date();
            currentHourISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:00`;
        }
        let startIndex = h.time.findIndex(t => t >= currentHourISO);
        let base = startIndex === -1 ? 0 : startIndex;
        const items = [];
        for (let i = 0; i < 4; i++) {
            const idx = base + i * 3;
            if (idx >= h.time.length)
                break;
            const timeStr = h.time[idx];
            const d = new Date(String(timeStr).replace("T", " ").replace(/-/g, "/"));
            const timeLabel = !isNaN(d.getTime()) ? d.toLocaleTimeString(Qt.locale(), "HH:mm") : "N/A";
            items.push({
                time: timeLabel,
                temp: h.temperature_2m ? h.temperature_2m[idx] : undefined,
                code: h.weather_code ? h.weather_code[idx] : undefined,
                precip: h.precipitation ? (h.precipitation[idx] ?? 0) : 0
            });
        }
        return items;
    }
    function applyCity() {
        const text = cityEntry.text;
        if (text && text.trim() === "") {
            root.clearCity();
            return;
        }
        Weather.setCity(text);
        root.savedCity = cityEntry.text;
        root._entryDirty = false;
    }
    function clearCity() {
        Weather.setCity("");
        root.savedCity = "";
        root._entryDirty = false;
        cityEntry.text = "";
    }

    Column {
        id: content
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.topMargin: root.islandMargins
        width: root.islandWidth
        spacing: 10

        Label {
            visible: !root.hasData
            text: "Weather data unavailable"
            color: Theme.fgDim
        }

        // ---- current conditions (code-colored header card) ----
        Rectangle {
            visible: root.hasData
            width: parent.width
            height: headerCol.height + 28
            radius: Theme.radius
            color: root.codeBg

            Column {
                id: headerCol
                anchors.top: parent.top
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.topMargin: 14
                width: parent.width - 28
                spacing: 10

                Row {
                    spacing: 20
                    width: parent.width

                    // Main column: icon, city, temp, description, feels-like, date
                    Column {
                        spacing: 4
                        width: (parent.width - 20) / 2

                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: Weather.icon(root.cur.weather_code)
                            font.family: Theme.fontFamily
                            font.pixelSize: Theme.fontSize + 12
                            color: "white"
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: root.hasData ? "󰍎 " + (root.wx.city || "Auto (IP)") : ""
                            font.pixelSize: Theme.fontSize
                            font.bold: true
                            color: "white"
                            font.family: Theme.fontFamily
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: root.fmtRaw(root.cur.temperature_2m, root.tempUnit)
                            font.pixelSize: Theme.fontSize + 10
                            font.bold: true
                            color: "white"
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: Weather.description(root.cur.weather_code)
                            color: "#E0E0E0"
                            font.pixelSize: Theme.fontSize
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: `Feels like: ${root.fmtRaw(root.cur.apparent_temperature, root.tempUnit)}`
                            color: "#CFCFCF"
                            font.pixelSize: Theme.fontSize - 2
                        }
                        Text {
                            anchors.horizontalCenter: parent.horizontalCenter
                            text: root.formatDate(root.day.time ? root.day.time[0] : undefined)
                            color: "#CFCFCF"
                            font.pixelSize: Theme.fontSize - 2
                        }
                    }

                    // Side column: sun, humidity/precip, wind
                    Column {
                        spacing: 6
                        width: (parent.width - 20) / 2

                        Row {
                            spacing: 5
                            anchors.horizontalCenter: parent.horizontalCenter
                            Column {
                                spacing: 2
                                Text {
                                    text: ""
                                    font.family: Theme.fontFamily
                                    color: "white"
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                                Text {
                                    text: root.formatTime(root.day.sunrise ? root.day.sunrise[0] : undefined)
                                    color: "white"
                                    font.pixelSize: Theme.fontSize - 2
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                            }
                            Text {
                                text: ""
                                color: "#DDD"
                                font.pixelSize: Theme.fontSize
                                font.family: Theme.fontFamily
                            }
                            Column {
                                spacing: 2
                                Text {
                                    text: ""
                                    font.family: Theme.fontFamily
                                    color: "white"
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                                Text {
                                    text: root.formatTime(root.day.sunset ? root.day.sunset[0] : undefined)
                                    color: "white"
                                    font.pixelSize: Theme.fontSize - 2
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                            }
                        }

                        Row {
                            spacing: 6
                            anchors.horizontalCenter: parent.horizontalCenter
                            Rectangle {
                                width: 88
                                height: 34
                                radius: 6
                                color: "#22FFFFFF"
                                Column {
                                    anchors.centerIn: parent
                                    spacing: 1
                                    Text {
                                        text: ""
                                        font.family: Theme.fontFamily
                                        color: "white"
                                        font.pixelSize: Theme.fontSize - 3
                                        anchors.horizontalCenter: parent.horizontalCenter
                                    }
                                    Text {
                                        text: root.fmt(root.cur.relative_humidity_2m, "%")
                                        color: "white"
                                        font.pixelSize: Theme.fontSize - 3
                                        anchors.horizontalCenter: parent.horizontalCenter
                                    }
                                }
                            }
                            Rectangle {
                                width: 88
                                height: 34
                                radius: 6
                                color: "#22FFFFFF"
                                Column {
                                    anchors.centerIn: parent
                                    spacing: 1
                                    Text {
                                        text: ""
                                        font.family: Theme.fontFamily
                                        color: "white"
                                        font.pixelSize: Theme.fontSize - 3
                                        anchors.horizontalCenter: parent.horizontalCenter
                                    }
                                    Text {
                                        text: root.fmt(root.cur.precipitation, " mm")
                                        color: "white"
                                        font.pixelSize: Theme.fontSize - 3
                                        anchors.horizontalCenter: parent.horizontalCenter
                                    }
                                }
                            }
                        }

                        Rectangle {
                            width: 182
                            height: 34
                            radius: 6
                            color: "#22FFFFFF"
                            anchors.horizontalCenter: parent.horizontalCenter
                            Column {
                                anchors.centerIn: parent
                                spacing: 1
                                Text {
                                    text: ""
                                    font.family: Theme.fontFamily
                                    color: "white"
                                    font.pixelSize: Theme.fontSize - 3
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                                Text {
                                    text: `${root.fmtRaw(root.cur.wind_speed_10m, "")} ${root.windUnit} ${Weather.windDirection(root.cur.wind_direction_10m)}`
                                    color: "white"
                                    font.pixelSize: Theme.fontSize - 3
                                    anchors.horizontalCenter: parent.horizontalCenter
                                }
                            }
                        }
                    }
                }

                // City search entry + apply + clear
                Row {
                    spacing: 8
                    anchors.horizontalCenter: parent.horizontalCenter
                    width: parent.width

                    AppTextField {
                        id: cityEntry
                        placeholderText: (root.wx && root.wx.city ? "Search..." : "Not " + ((root.wx && root.wx.city) || "IP") + "?...")
                        text: root.savedCity
                        onTextChanged: root._entryDirty = true
                        onAccepted: root.applyCity()
                        width: parent.width - 72
                        height: 30
                        color: "white"
                        fillColor: "#33000000"
                        placeholderTextColor: "#CCFFFFFF"
                    }
                    AppButton {
                        width: 30
                        height: 30
                        icon: ""
                        pixelSize: 14
                        cornerRadius: 6
                        idleBg: "#33000000"
                        idleFg: "white"
                        hoverBg: "#33000000"
                        outlined: true
                        outlineColor: "#55FFFFFF"
                        tooltipText: "Search city"
                        onClicked: root.applyCity()
                    }
                    AppButton {
                        width: 30
                        height: 30
                        icon: "󰦛"
                        pixelSize: 14
                        cornerRadius: 6
                        idleBg: "#33000000"
                        idleFg: "white"
                        hoverBg: "#33000000"
                        outlined: true
                        outlineColor: "#55FFFFFF"
                        tooltipText: "Auto (IP)"
                        onClicked: root.clearCity()
                    }
                }
            }
        }

        // ---- today's forecast ----
        Column {
            visible: root.hasData
            width: parent.width
            spacing: 8

            Label {
                text: "Today's Forecast"
                font.pixelSize: Theme.fontSize
                font.bold: true
                color: Theme.fg
            }

            Row {
                spacing: 8
                width: parent.width
                Repeater {
                    model: [
                        { label: "Max", value: root.fmtRaw(root.day.temperature_2m_max ? root.day.temperature_2m_max[0] : undefined, root.tempUnit) },
                        { label: "Min", value: root.fmtRaw(root.day.temperature_2m_min ? root.day.temperature_2m_min[0] : undefined, root.tempUnit) },
                        { label: "Rain", value: `${root.day.precipitation_sum ? (root.day.precipitation_sum[0] ?? 0) : 0} mm` },
                        { label: "Wind", value: `${root.day.wind_speed_10m_max ? (root.day.wind_speed_10m_max[0] ?? "N/A") : "N/A"} ${root.windUnit}` }
                    ]
                    delegate: Rectangle {
                        width: parent.width / 4 - 6
                        height: 56
                        radius: 8
                        color: Theme.surface
                        border.color: Theme.border
                        Column {
                            anchors.centerIn: parent
                            spacing: 2
                            Text {
                                text: modelData.label
                                color: Theme.fgDim
                                font.pixelSize: Theme.fontSize - 3
                                anchors.horizontalCenter: parent.horizontalCenter
                            }
                            Text {
                                text: modelData.value
                                color: Theme.fg
                                font.pixelSize: Theme.fontSize - 2
                                font.bold: true
                                anchors.horizontalCenter: parent.horizontalCenter
                                wrapMode: Text.WordWrap
                                horizontalAlignment: Text.AlignHCenter
                            }
                        }
                    }
                }
            }
        }

        // ---- hourly forecast ----
        Column {
            visible: root.hasData
            width: parent.width
            spacing: 8

            Label {
                text: "Hourly Forecast"
                font.pixelSize: Theme.fontSize
                font.bold: true
                color: Theme.fg
            }

            Row {
                spacing: 8
                width: parent.width
                Repeater {
                    model: root.hourlyItems()
                    delegate: Rectangle {
                        width: parent.width / 4 - 6
                        height: 78
                        radius: 8
                        color: Theme.surface
                        border.color: Theme.border
                        Column {
                            anchors.centerIn: parent
                            spacing: 4
                            Text {
                                text: Weather.icon(modelData.code)
                                font.family: Theme.fontFamily
                                color: Theme.accent
                                font.pixelSize: Theme.fontSize + 4
                                anchors.horizontalCenter: parent.horizontalCenter
                            }
                            Text {
                                text: `${Math.round(modelData.temp)}°  ${modelData.time}`
                                color: Theme.fg
                                font.pixelSize: Theme.fontSize - 2
                                anchors.horizontalCenter: parent.horizontalCenter
                            }
                            Text {
                                visible: modelData.precip > 0
                                text: `${modelData.precip}mm`
                                color: Theme.accent
                                font.pixelSize: Theme.fontSize - 3
                                anchors.horizontalCenter: parent.horizontalCenter
                            }
                        }
                    }
                }
            }
        }
    }

    // Pin while hovered so the pulse doesn't close it mid-interaction.
    HoverHandler {
        id: islandHover
        onHoveredChanged: {
            if (islandHover.hovered) {
                leaveTimer.stop();
                BarState.activate("weather", 0);
            } else {
                leaveTimer.restart();
            }
        }
    }
    Timer {
        id: leaveTimer
        interval: 1000
        onTriggered: BarState.deactivate("weather")
    }
    Component.onCompleted: leaveTimer.restart()
}
