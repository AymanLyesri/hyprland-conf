
import { Resources } from "widgets/Resources";
import waifu, { WaifuVisibility } from "./components/waifu";
import { globalMargin, rightPanelExclusivity, rightPanelVisibility, rightPanelWidth, waifuVisibility } from "variables";
import { setOption } from "utils/options";
import Calendar from "widgets/Calendar";
import Update from "widgets/Update";
import NotificationHistory from "./NotificationHistory";



const maxRightPanelWidth = 600;
const minRightPanelWidth = 200;

function WindowActions()
{
    return Widget.Box({
        class_name: "window-actions",
        hpack: "end",
        spacing: 5
    }, Widget.Button({
        label: "",
        class_name: "expand-window",
        on_clicked: () => rightPanelWidth.value = rightPanelWidth.value < maxRightPanelWidth ? rightPanelWidth.value + 50 : maxRightPanelWidth,
    }), Widget.Button({
        label: "",
        class_name: "shrink-window",
        on_clicked: () => rightPanelWidth.value = rightPanelWidth.value > minRightPanelWidth ? rightPanelWidth.value - 50 : minRightPanelWidth,
    }), WaifuVisibility(),
        Widget.ToggleButton({
            label: "󰐃",
            class_name: "exclusivity",
            onToggled: ({ active }) =>
            {
                rightPanelExclusivity.value = active;
            },
        }).hook(rightPanelExclusivity, (self) => self.active = rightPanelExclusivity.value, "changed"),
        Widget.Button({
            label: "",
            class_name: "close",
            on_clicked: () => rightPanelVisibility.value = false,
        }),
    )


}


function Panel()
{
    return Widget.Box({
        css: rightPanelWidth.bind().as(width => `*{min-width: ${width}px}`),
        vertical: true,
        // spacing: 5,
        children: [
            WindowActions(),
            waifu(),
            Separator(),
            Resources(),
            Separator(),
            Update(),
            Separator(),
            NotificationHistory()
        ],
    })
}

const Separator = () => Widget.Separator({ vertical: false });

const Window = () => Widget.Window({
    name: `right-panel`,
    class_name: "right-panel",
    anchor: ["right", "top", "bottom"],
    exclusivity: "normal",
    layer: "overlay",
    keymode: "on-demand",
    visible: rightPanelVisibility.value,
    child: Panel(),
}).hook(rightPanelExclusivity, (self) =>
{
    self.exclusivity = rightPanelExclusivity.value ? "exclusive" : "normal"
    self.layer = rightPanelExclusivity.value ? "bottom" : "top"
    self.class_name = rightPanelExclusivity.value ? "right-panel exclusive" : "right-panel normal"
    self.margins = rightPanelExclusivity.value ? [0, 0] : [5, globalMargin, globalMargin, globalMargin]
}, "changed").hook(rightPanelVisibility, (self) => self.visible = rightPanelVisibility.value, "changed");

export default () =>
{
    return Window();
}