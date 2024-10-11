import { barPin } from "variables";

export default () =>
{
    return Widget.Window({
        name: `bar-hover`, // name has to be unique
        anchor: ["top", "left", "right"],
        exclusivity: "ignore",
        layer: "overlay",
        child: Widget.EventBox({
            hexpand: true,
            vexpand: true,
            on_hover: () => App.openWindow("bar"),
            child: Widget.Box({ css: `min-height: 5px;` }),
        }),
    });
}