import { rightPanelLock, rightPanelVisibility } from "variables";

export default () =>
{
    return Widget.Window({
        name: `right-panel-hover`, // name has to be unique
        anchor: ["right", "top", "bottom"],
        exclusivity: "ignore",
        layer: "top",
        child: Widget.EventBox({
            hexpand: true,
            vexpand: true,
            on_hover: () => { if (!rightPanelLock.value) rightPanelVisibility.value = true },
            child: Widget.Box({ css: `min-width: 1px;` }),
        }),
    });
}