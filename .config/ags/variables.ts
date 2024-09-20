const hyprland = await Service.import("hyprland");

export const waifuPath = App.configDir + "/assets/images/waifu.jpg"

export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)

export const rightPanelExclusivity = Variable(true)

export const globalMargin = 15