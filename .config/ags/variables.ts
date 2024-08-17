const hyprland = await Service.import("hyprland");

export var bar_margins = hyprland.active.client.bind("title").as((title) =>
{
    let margin = title ? 0 : 10
    let top = Number(margin) * 6.9 + 5
    let bottom = 0
    let sides = Number(margin) * 5 + 5
    return [top, sides, bottom, sides] // top right bottom left
})

// export var margins = () =>
// {
//     let margin = 0
//     margin = hyprland.active.client.bind("title") ? margin = 10 : margin = 0
//     return margin
// }