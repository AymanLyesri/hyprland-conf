import { getOption, setOption } from "utils/options";

const hyprland = await Service.import("hyprland");

export const waifuPath = App.configDir + "/assets/images/waifu.jpg"

export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)

export const rightPanelExclusivity = Variable(getOption("rightPanel.exclusivity"))
export const rightPanelWidth = Variable<number>(getOption("rightPanel.width"))
rightPanelWidth.connect("changed", ({ value }) => setOption("rightPanel.width", value));

export const globalMargin = 15