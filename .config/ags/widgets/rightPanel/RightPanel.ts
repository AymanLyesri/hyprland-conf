
import waifu, { WaifuVisibility } from "./components/waifu";
import { globalMargin, rightPanelExclusivity, rightPanelVisibility, rightPanelWidth, widgetLimit, Widgets } from "variables";
import Calendar from "widgets/Calendar";
import Update from "widgets/Update";
import NotificationHistory from "./NotificationHistory";
import { WidgetSelector } from "interfaces/widgetSelector.interface";


export const WidgetSelectors: WidgetSelector[] = [{
    name: "Waifu",
    icon: "",
    widget: () => waifu()
}, {
    name: "Calendar",
    icon: "",
    widget: () => Calendar()
}, {
    name: "Update",
    icon: "󰚰",
    widget: () => Update()
}, {
    name: "NotificationHistory",
    icon: "",
    widget: () => NotificationHistory()
}]



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

const Selectors = () => Widget.Box({
    class_name: "selectors",
    vertical: true,
    spacing: 5,
    children: WidgetSelectors.map(selector =>
        Widget.ToggleButton({
            class_name: "selector",
            label: selector.icon,
            active: Widgets.value.find(w => w.name == selector.name) ? true : false,
            on_toggled: (self) =>
            {
                // If the button is active, create and store a new widget instance
                if (self.active) {
                    // Limit the number of widgets to 3
                    if (Widgets.value.length >= widgetLimit) {
                        self.active = false;
                        return;
                    }
                    // Create widget only if it's not already created
                    if (!selector.widgetInstance) {
                        selector.widgetInstance = selector.widget();
                    }
                    // Add the widget instance to Widgets if it's not already added
                    if (!Widgets.value.includes(selector)) {
                        Widgets.value = [...Widgets.value, selector];
                    }
                }
                // If the button is deactivated, remove the widget from the array
                else if (!self.active) {
                    Widgets.value = Widgets.value.filter(w => w != selector);  // Remove it from the array
                    selector.widgetInstance = undefined;  // Reset the widget instance
                }
            }
        })
    )

})


function Panel()
{
    return Widget.Box({
        children: [Widget.Box({
            css: rightPanelWidth.bind().as(width => `*{min-width: ${width}px}`),
            vertical: true,
            spacing: 5,
            children: Widgets.bind().as(widgets => widgets.map(widget => widget.widget())),
        })
            , Selectors()
        ]
    })
}

// const Separator = () => Widget.Separator({ vertical: false });

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