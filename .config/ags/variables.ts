// import { WidgetSelector } from "interfaces/widgetSelector.interface";
import exp from "constants";
import { bind, Variable } from "../../../../usr/share/astal/gjs";
import { getSetting, setSetting } from "./utils/settings";
// import { WidgetSelectors } from "widgets/rightPanel/RightPanel";

import Hyprland from "gi://AstalHyprland";
import { WidgetSelector } from "./interfaces/widgetSelector.interface";
import { WidgetSelectors } from "./widgets/rightPanel/RightPanel";
const hyprland = Hyprland.get_default();

export const globalOpacity = Variable<number>(getSetting("globalOpacity"))
// globalOpacity.connect("changed", ({ value }) =>
// {
//     setSetting("globalOpacity", value)
//     refreshCss()
// });

export const globalMargin = 14
export const globalTransition = 500

export const date_less = Variable("").poll(1000, 'date "+%H:%M"')
export const date_more = Variable("").poll(1000, 'date "+:%S %b %e, %A."')

export const barLock: Variable<boolean> = Variable(getSetting("bar.lock"))
bind(barLock).as((value) => setSetting("bar.lock", value));

export const waifuFavorites = Variable<{ id: number, preview: string }[]>(getSetting("waifu.favorites"))
bind(waifuFavorites).as((value) => setSetting("waifu.favorites", value));
export const waifuCurrent = Variable(getSetting("waifu.current"))
bind(waifuCurrent).as((value) => setSetting("waifu.current", value));

// export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)
export const emptyWorkspace = 0

export const newAppWorkspace = Variable(0)

export const rightPanelVisibility = Variable(getSetting("rightPanel.visibility"));
bind(rightPanelVisibility).as((value) => setSetting("rightPanel.visibility", value));
export const rightPanelExclusivity = Variable(getSetting("rightPanel.exclusivity"));
bind(rightPanelExclusivity).as((value) => setSetting("rightPanel.exclusivity", value));
export const rightPanelWidth = Variable<number>(getSetting("rightPanel.width"));
bind(rightPanelWidth).as((value) => setSetting("rightPanel.width", value));
export const rightPanelLock = Variable(getSetting("rightPanel.lock"));
bind(rightPanelLock).as((value) => setSetting("rightPanel.lock", value));

export const DND = Variable(getSetting("notifications.dnd"));
bind(DND).as((value) => setSetting("notifications.dnd", value));

export const widgetLimit = 5
// export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets").map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
// Widgets.connect("changed", ({ value }) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));
export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets")
    .map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
bind(Widgets).as((value) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));

export const userPanelVisibility = Variable(false)

export const settingsVisibility = Variable(false)

export const quickLauncherVisibility = Variable(false)