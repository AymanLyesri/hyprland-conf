import { quickLauncherVisibility } from "variables";

export default () =>
{
    return Widget.Window({
        name: `quick-launcher-hover`, // name has to be unique
        anchor: ["bottom", "left", "right"],
        exclusivity: "ignore",
        layer: "top",
        child: Widget.EventBox({
            hexpand: true,
            vexpand: true,
            on_hover: () => quickLauncherVisibility.value = true,
            child: Widget.Box({ css: `min-height: 1px;` }),
        }),
    });
}