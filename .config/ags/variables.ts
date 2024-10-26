import { WidgetSelector } from "interfaces/widgetSelector.interface";
import { refreshCss } from "utils/scss";
import { getSetting, globalSettings, setSetting } from "utils/settings";
import { WidgetSelectors } from "widgets/rightPanel/RightPanel";

const hyprland = await Service.import("hyprland");

export const globalOpacity = Variable<number>(getSetting("globalOpacity"))
globalOpacity.connect("changed", ({ value }) =>
{
    setSetting("globalOpacity", value)
    refreshCss()
});

export const globalMargin = 15
export const globalTransition = 500

export const date_less = Variable("", {
    poll: [1000, 'date "+%H:%M"'],
});
export const date_more = Variable("", {
    poll: [1000, 'date "+:%S %b %e, %A."']
});



export const barLock = Variable(getSetting("bar.lock"))
barLock.connect("changed", ({ value }) => setSetting("bar.lock", value));

export const waifuFavorites = Variable<{ id: number, preview: string }[]>(getSetting("waifu.favorites"))
waifuFavorites.connect("changed", ({ value }) => setSetting("waifu.favorites", value));
export const waifuCurrent = Variable(getSetting("waifu.current"))
waifuCurrent.connect("changed", ({ value }) => setSetting("waifu.current", value));

export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)

export const newAppWorkspace = Variable(0)

export const rightPanelVisibility = Variable(getSetting("rightPanel.visibility"))
rightPanelVisibility.connect("changed", ({ value }) => setSetting("rightPanel.visibility", value));
export const rightPanelExclusivity = Variable(getSetting("rightPanel.exclusivity"))
rightPanelExclusivity.connect("changed", ({ value }) => { setSetting("rightPanel.exclusivity", value) });
export const rightPanelWidth = Variable<number>(getSetting("rightPanel.width"))
rightPanelWidth.connect("changed", ({ value }) => setSetting("rightPanel.width", value));
export const rightPanelLock = Variable(getSetting("rightPanel.lock"))
rightPanelLock.connect("changed", ({ value }) => setSetting("rightPanel.lock", value));

export const DND = Variable(getSetting("notifications.dnd"))
DND.connect("changed", ({ value }) => setSetting("notifications.dnd", value));

export const widgetLimit = 5
export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets").map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
Widgets.connect("changed", ({ value }) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));

export const userPanelVisibility = Variable(false)

export const settingsVisibility = Variable(false)