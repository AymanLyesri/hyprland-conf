const hyprland = await Service.import("hyprland");

export const waifuPath = App.configDir + "/assets/images/waifu.jpg"

export const emptyWorkspace = hyprland.active.client.bind("title").as(title => title ? 0 : 1)



export const mediaVisibility = Variable(false)
export const rightPanelVisibility = Variable(false)
export const appLauncherVisibility = Variable(false)
globalThis.appLauncherVisibility = appLauncherVisibility

export const progressVisibility = Variable(false)