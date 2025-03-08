import { autoCreateSettings, defaultSettings, getSetting, setSetting, settingsPath } from "./utils/settings";

import { WidgetSelector } from "./interfaces/widgetSelector.interface";
import { WidgetSelectors } from "./widgets/rightPanel/RightPanel";
import { refreshCss } from "./utils/scss";
import { GLib, Variable } from "astal";
import { writeJSONFile } from "./utils/json";

// Settings are stored in a json file, containing all the settings, check if it exists, if not, create it
export const globalSettings = Variable<Settings>(defaultSettings);
autoCreateSettings();
globalSettings.subscribe((value) => writeJSONFile(settingsPath, value));

export const globalOpacity = Variable<number>(getSetting("globalOpacity"))
globalOpacity.subscribe((value) =>
{
    setSetting("globalOpacity", value)
    refreshCss()
});

export const globalMargin = 14
export const globalTransition = 500

export const date_less = Variable("").poll(1000, () => GLib.DateTime.new_now_local().format("%H:%M")!);
export const date_more = Variable("").poll(1000, () => GLib.DateTime.new_now_local().format(":%S %b %e, %A.")!);

export const barLock: Variable<boolean> = Variable(getSetting("bar.lock"));
barLock.subscribe((value) => setSetting("bar.lock", value));

export const waifuFavorites = Variable<{ id: number, preview: string }[]>(getSetting("waifu.favorites"));
waifuFavorites.subscribe((value) => setSetting("waifu.favorites", value));
export const waifuCurrent = Variable(getSetting("waifu.current"));
waifuCurrent.subscribe((value) => setSetting("waifu.current", value));

// export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)
export const emptyWorkspace = 0

export const newAppWorkspace = Variable(0)

export const rightPanelVisibility = Variable(getSetting("rightPanel.visibility"));
rightPanelVisibility.subscribe((value) => setSetting("rightPanel.visibility", value));
export const rightPanelExclusivity = Variable(getSetting("rightPanel.exclusivity"));
rightPanelExclusivity.subscribe((value) => setSetting("rightPanel.exclusivity", value));
export const rightPanelWidth = Variable<number>(getSetting("rightPanel.width"));
rightPanelWidth.subscribe((value) => setSetting("rightPanel.width", value));
export const rightPanelLock = Variable(getSetting("rightPanel.lock"));
rightPanelLock.subscribe((value) => setSetting("rightPanel.lock", value));

export const DND = Variable(getSetting("notifications.dnd"));
DND.subscribe((value) => setSetting("notifications.dnd", value));

export const widgetLimit = 5
export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets")
    .map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
Widgets.subscribe((value) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));

export const userPanelVisibility = Variable(false)

export const settingsVisibility = Variable(false)

export const quickLauncherVisibility = Variable(false)
