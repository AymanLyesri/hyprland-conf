
import { Notification_ } from "./components/notification";
import { Resources } from "widgets/Resources";
import waifu from "./components/waifu";
import { globalMargin, rightPanelExclusivity, rightPanelWidth } from "variables";
import { setOption } from "utils/options";

const Notifications = await Service.import("notifications")

const maxRightPanelWidth = 600;
const minRightPanelWidth = 300;

function WindowActions()
{
    return Widget.Box({
        class_name: "window-actions",
        hpack: "end", spacing: 5
    }, Widget.Button({
        label: "",
        class_name: "expand-window",
        on_clicked: () => rightPanelWidth.value = rightPanelWidth.value < maxRightPanelWidth ? rightPanelWidth.value + 50 : maxRightPanelWidth,
    }),
        Widget.Button({
            label: "",
            class_name: "shrink-window",
            on_clicked: () => rightPanelWidth.value = rightPanelWidth.value > minRightPanelWidth ? rightPanelWidth.value - 50 : minRightPanelWidth,
        }),
        Widget.ToggleButton({
            label: "󰐃",
            class_name: "exclusivity",
            onToggled: ({ active }) =>
            {
                rightPanelExclusivity.value = active;
            },
            setup: (self) => self.active = rightPanelExclusivity.value,
        }),
        Widget.Button({
            label: "",
            class_name: "close",
            on_clicked: () => App.closeWindow("right-panel"),
        }),
    )


}


interface Filter
{
    name: string
    color: string
}

const notificationFilter = Variable<Filter>({ name: "", color: "" });

function Filter()
{
    const Filters: Filter[] = [{
        name: "Spotify",
        color: "rgba(30, 215, 96, 0.5)",
    }, {
        name: "QBittorent",
        color: "rgba(0, 123, 255, 0.5)",
    }, {
        name: "Clipboard",
        color: "rgba(33, 150, 243, 0.5)",
    }, {
        name: "Update",
        color: "rgba(255, 152, 0, 0.5)",
    }];

    return Widget.Box({
        class_name: "filter",
        hexpand: false,
        children: Filters.map(filter =>
        {
            return Widget.Button({
                label: filter.name,
                hexpand: true,
                on_clicked: () => notificationFilter.value = (notificationFilter.value === filter ? { name: "", color: "" } : filter),
                class_name: "",
                css: notificationFilter.bind().as(filter => `background: ${filter.color}`),
            });
        })
    })
}


const ClearNotifications = () =>
{
    return Widget.Button({
        class_name: "clear",
        label: "Clear",
        on_clicked: () =>
        {
            NotificationsDisplay.child = Widget.Box({
                vertical: true,
                children: [],
            });
            Notifications.clear().finally(() => NotificationsDisplay.child = NotificationHistory())
        },
    })
}




function FilterNotifications(notifications: any[], filter: string): any[]
{
    const filtered: any[] = [];
    const others: any[] = [];

    notifications.forEach((notification: any) =>
    {
        if (notification.app_name.includes(filter) || notification.summary.includes(filter)) {
            filtered.unshift(notification);
        } else {
            others.unshift(notification);
        }
    });
    return [...filtered, ...others].slice(0, 50); // Limit to the last 50 notifications DEFAULT, higher number will slow down the UI
}

const NotificationHistory = () => Widget.Box({
    vertical: true,
    children: Utils.merge([notificationFilter.bind(), Notifications.bind("notifications")], (filter, notifications) =>
    {
        if (!notifications) return [];
        return FilterNotifications(notifications, filter.name)
            .map(notification =>
            {
                return Widget.EventBox(
                    {
                        class_name: "notification-event",
                        on_primary_click: () => Utils.execAsync(`wl-copy "${notification.body}"`).catch(err => print(err)),
                        child: Notification_(notification),
                    });
            })
    }),
})

const Separator = () => Widget.Separator({ vertical: false });

const NotificationsDisplay = Widget.Scrollable({
    class_name: "notification-history",
    hscroll: 'never',
    vexpand: true,
    child: NotificationHistory(),
})

const NotificationPanel = () =>
{
    return Widget.Box({
        class_name: "notification-panel",
        // spacing: 5,
        vertical: true,
        children: [Filter(), NotificationsDisplay, ClearNotifications()],
    })
}


function Panel()
{
    return Widget.Box({
        css: rightPanelWidth.bind().as(width => `*{min-width: ${width}px}`),
        vertical: true,
        // spacing: 5,
        children: [WindowActions(), waifu(), Separator(), Resources(), Separator(), NotificationPanel()],
    })
}

const Window = () => Widget.Window({
    name: `right-panel`,
    class_name: "right-panel",
    anchor: ["right", "top", "bottom"],
    exclusivity: "normal",
    layer: "overlay",
    keymode: "on-demand",
    visible: false,
    child: Panel(),
}).hook(rightPanelExclusivity, (self) =>
{
    self.exclusivity = rightPanelExclusivity.value ? "exclusive" : "normal"
    self.layer = rightPanelExclusivity.value ? "bottom" : "top"
    self.class_name = rightPanelExclusivity.value ? "right-panel exclusive" : "right-panel normal"
    self.margins = rightPanelExclusivity.value ? [0, 0] : [5, globalMargin, globalMargin, globalMargin]
}, "changed");

export default () =>
{
    return Window();
}