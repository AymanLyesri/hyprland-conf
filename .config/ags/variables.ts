const hyprland = await Service.import("hyprland");

export const waifuPath = App.configDir + "/assets/images/waifu.jpg"

export var bar_margin = hyprland.active.client.bind("title").as((title) =>
{
    // let margin = title ? 0 : 10
    // let top = Number(margin) * 6.9 + 5
    // let bottom = 0
    // let sides = Number(margin) * 5 + 5
    // return [top, sides, bottom, sides] // top right bottom left
    return title ? 0 : 10
})

export const mediaVisibility = Variable(false)

export const rightPanelVisibility = Variable(false)

export const appLauncherVisibility = Variable(false)
globalThis.appLauncherVisibility = appLauncherVisibility