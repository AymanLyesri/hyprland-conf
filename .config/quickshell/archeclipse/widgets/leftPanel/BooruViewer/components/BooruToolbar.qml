import QtQuick
import QtQuick.Layouts
import qs.theme
import qs.widgets.shared
import qs.services

// API / Bookmarks / Pins tabs (extracted verbatim from BooruViewerWidget).
// viewer: entry root (selectedTab, progressStatus, fetchImages...).
Item {
    property var viewer
    id: tabRow
    Layout.fillWidth: true
    implicitWidth: seg.implicitWidth
    implicitHeight: seg.implicitHeight

    // Tab values mirror viewer.selectedTab: API names + Bookmarks + Pins.
    readonly property var tabValues: tabRow.viewer ? tabRow.viewer.booruApis.map(a => a.name).concat(["Bookmarks", "Pins"]) : []

    // Shared tab-switch plumbing (page reset); the per-tab load call differs.
    function resetPage() {
        viewer.page = 1;
        Settings.booru.page = 1;
        Settings.updateSetting("booru.page", 1);
    }
    function activateTab(v) {
        if (v === "Bookmarks") {
            viewer.selectedTab = "Bookmarks";
            Settings.booru.selectedTab = "Bookmarks";
            Settings.updateSetting("booru.selectedTab", "Bookmarks");
            tabRow.resetPage();
            // Load bookmarks (AGS: paginate + download previews)
            viewer.loadBookmarks();
        } else if (v === "Pins") {
            viewer.selectedTab = "Pins";
            Settings.booru.selectedTab = "Pins";
            Settings.updateSetting("booru.selectedTab", "Pins");
            tabRow.resetPage();
            // Load pins (AGS: paginate + download previews)
            viewer.loadPins();
        } else {
            const api = viewer.booruApis.find(a => a.name === v) || viewer.booruApis[0];
            Settings.booru.api = api;
            Settings.updateSetting("booru.api", api);
            viewer.selectedTab = api.name;
            Settings.booru.selectedTab = api.name;
            Settings.updateSetting("booru.selectedTab", api.name);
            tabRow.resetPage();
            viewer.fetchImages();
        }
    }

    AppSegmentedControl {
        id: seg
        anchors.centerIn: parent
        enabled: tabRow.viewer && tabRow.viewer.progressStatus !== "loading"
        pixelSize: Theme.fontSize - 2
        model: tabRow.viewer ? tabRow.viewer.booruApis.map(a => ({
            value: a.name,
            label: a.name
        })).concat([
            {
                value: "Bookmarks",
                label: "\u{F02E}",
                tooltip: "Bookmarks"
            },
            {
                value: "Pins",
                label: "\u{F435}",
                tooltip: "Pins"
            }
        ]) : []
        currentIndex: tabRow.tabValues.indexOf(tabRow.viewer ? tabRow.viewer.selectedTab : "")
        onActivated: (i, v) => tabRow.activateTab(v)
    }
}
