import { Waifu } from "widgets/waifu";
import { Notification } from "./notification";
import { Resources } from "widgets/resources";
import { rightPanelVisibility } from "variables";

const Notifications = await Service.import("notifications")
// notifications.popupTimeout = 3000;
// notifications.forceTimeout = false;
// notifications.cacheActions = false;
// notifications.clearDelay = 100;

const notificationFilter = Variable<Filter>({ name: "", color: "" });

interface Filter
{
    name: string
    color: string
}

const Filters: Filter[] = [{
    name: "Spotify",
    color: "#1DB954",
}, {
    name: "QBittorent",
    color: "#3775A9",
}, {
    name: "Clipboard",
    color: "#000000",
}]
function Options()
{
    return Widget.Box({
        class_name: "options",
        hexpand: true,
        children: Filters.map(filter =>
        {
            return Widget.Button({
                label: filter.name,
                hexpand: true,
                on_clicked: () => notificationFilter.value = filter,
                class_name: "module button",
                css: `background: ${notificationFilter.bind().as(filter => filter.color)}`,
            });
        })
    })
}


function FilterNotifications(notifications: any[], filter: string): any[]
{
    const filtered: any[] = [];
    const others: any[] = [];

    notifications.forEach((notification: any) =>
    {
        if (notification.app_name === filter || notification.summary === filter) {
            filtered.push(notification);
        } else {
            others.push(notification);
        }
    });

    return [...others, ...filtered].slice(-100).reverse();
}


function NotificationsDisplay()
{
    return Widget.Scrollable({
        class_name: "notification-history",
        hscroll: 'never',
        vexpand: true,
        child: Widget.Box({
            vertical: true, children: Utils.merge([notificationFilter.bind(), Notifications.bind("notifications")], (filter, notifications) =>
            {
                return FilterNotifications(notifications, filter.name)
                    .slice(-100).map(notification =>
                    {
                        // Limit to the last 100 notifications after sorting
                        return Widget.EventBox(
                            {
                                class_name: "notification-event",
                                on_primary_click: () => Utils.execAsync(`wl-copy "${notification.body}"`),
                                child: Notification(notification),
                            });

                    })
            }),
        }),
    })
}

function Panel()
{
    return Widget.Box({
        class_name: "right-panel",
        vertical: true,
        children: [Waifu(), Resources(), Options(), NotificationsDisplay()],
    })
}

export function RightPanel(monitor = 0)
{
    return Widget.Window({
        monitor,
        name: `right-panel`,
        class_name: "",
        anchor: ["right", "top", "bottom"],
        exclusivity: "exclusive",
        layer: "bottom",
        // margins: [10, 0, 0, 0],
        visible: rightPanelVisibility.bind(),
        // visible: true,
        child: Panel(),
    })
}