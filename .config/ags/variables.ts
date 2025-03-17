import { autoCreateSettings, defaultSettings, getSetting, setSetting, settingsPath } from "./utils/settings";

import Hyprland from "gi://AstalHyprland";
const hyprland = Hyprland.get_default();

import { WidgetSelector } from "./interfaces/widgetSelector.interface";
import { WidgetSelectors } from "./widgets/rightPanel/RightPanel";
import { refreshCss } from "./utils/scss";
import { bind, Binding, GLib, Variable } from "astal";
import { writeJSONFile } from "./utils/json";
import { AGSSetting, Settings } from "./interfaces/settings.interface";
import { Api } from "./interfaces/api.interface";
import { Waifu } from "./interfaces/waifu.interface";

export const NOTIFICATION_DELAY = 5000

// Settings are stored in a json file, containing all the settings, check if it exists, if not, create it
export const globalSettings = Variable<Settings>(defaultSettings);
autoCreateSettings();
globalSettings.subscribe((value) => writeJSONFile(settingsPath, value));

export const globalOpacity = Variable<AGSSetting>(getSetting("globalOpacity"))
globalOpacity.subscribe((value) =>
{
    setSetting("globalOpacity", value)
    refreshCss()
});
export const globalIconSize = Variable<AGSSetting>(getSetting("globalIconSize"))
globalIconSize.subscribe((value) =>
{
    setSetting("globalIconSize", value)
    refreshCss()
});

export const globalMargin = 14
export const globalTransition = 500

export const date_less = Variable("").poll(1000, () => GLib.DateTime.new_now_local().format("%H:%M")!);
export const date_more = Variable("").poll(1000, () => GLib.DateTime.new_now_local().format(":%S %b %e, %A.")!);

export const barVisibility = Variable<boolean>(getSetting("bar.visibility"));
barVisibility.subscribe((value) => setSetting("bar.visibility", value));
export const barLock: Variable<boolean> = Variable(getSetting("bar.lock"));
barLock.subscribe((value) => setSetting("bar.lock", value));
export const barOrientation = Variable<boolean>(getSetting("bar.orientation"));
barOrientation.subscribe((value) => setSetting("bar.orientation", value));

export const waifuApi = Variable<Api>(getSetting("waifu.api"));
waifuApi.subscribe((value) => setSetting("waifu.api", value));
export const waifuCurrent = Variable<Waifu>(getSetting("waifu.current"));
waifuCurrent.subscribe((value) => setSetting("waifu.current", value));
export const waifuFavorites = Variable<Waifu[]>(getSetting("waifu.favorites"));
waifuFavorites.subscribe((value) => setSetting("waifu.favorites", value));

export const focusedClient: Binding<Hyprland.Client> = bind(hyprland, "focusedClient");
export const emptyWorkspace: Binding<boolean> = focusedClient.as((client) => !client);
export const focusedWorkspace: Binding<Hyprland.Workspace> = bind(hyprland, "focusedWorkspace");

export const newAppWorkspace = Variable(0)

export const rightPanelVisibility = Variable<boolean>(getSetting("rightPanel.visibility"));
rightPanelVisibility.subscribe((value) => setSetting("rightPanel.visibility", value));
export const rightPanelExclusivity = Variable<boolean>(getSetting("rightPanel.exclusivity"));
rightPanelExclusivity.subscribe((value) => setSetting("rightPanel.exclusivity", value));
export const rightPanelWidth = Variable<number>(getSetting("rightPanel.width"));
rightPanelWidth.subscribe((value) => setSetting("rightPanel.width", value));
export const rightPanelLock = Variable<boolean>(getSetting("rightPanel.lock"));
rightPanelLock.subscribe((value) => setSetting("rightPanel.lock", value));

export const DND = Variable<boolean>(getSetting("notifications.dnd"));
DND.subscribe((value) => setSetting("notifications.dnd", value));

export const widgetLimit = 5
export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets")
    .map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
Widgets.subscribe((value) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));

