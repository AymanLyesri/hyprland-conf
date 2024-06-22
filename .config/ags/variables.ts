const hyprland = await Service.import("hyprland");

// export var bar_margins = Variable<number[]>([0, 0], {
//     // listen to an array of [up, down] values
//     poll: [1000, App.configDir + '/scripts/bar-margin.sh', out => [Number(out) * 5 + 5, Number(out) * 15 + 5]],
// });

export var bar_margins = hyprland.active.client.bind("title").as((title) =>
{
    let margin = title ? 0 : 10
    return [Number(margin) * 5 + 5, Number(margin) * 15 + 5]
})

// export var margins = () =>
// {
//     let margin = 0
//     margin = hyprland.active.client.bind("title") ? margin = 10 : margin = 0
//     return margin
// }