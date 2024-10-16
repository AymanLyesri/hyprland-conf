import { WidgetSelector } from "interfaces/widgetSelector.interface";
import { getSetting, setSetting } from "utils/settings";
import { WidgetSelectors } from "widgets/rightPanel/RightPanel";

const hyprland = await Service.import("hyprland");

export const globalMargin = 15
export const globalTransition = 500

export const barLock = Variable(getSetting("bar.lock"))
barLock.connect("changed", ({ value }) => setSetting("bar.lock", value));

export const waifuVisibility = Variable(getSetting("waifu.visibility"))
waifuVisibility.connect("changed", ({ value }) => setSetting("waifu.visibility", value));
export const waifuFavorites = Variable<string[]>(getSetting("waifu.favorites"))
waifuFavorites.connect("changed", ({ value }) => setSetting("waifu.favorites", value));
export const waifuCurrent = Variable<string>(getSetting("waifu.current"))
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

export const widgetLimit = 5
export const Widgets = Variable<WidgetSelector[]>(getSetting("rightPanel.widgets").map((name: string) => WidgetSelectors.find(widget => widget.name === name)))
Widgets.connect("changed", ({ value }) => setSetting("rightPanel.widgets", value.map(widget => widget.name)));