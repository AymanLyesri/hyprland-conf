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
                on_clicked: () => notificationFilter.value = (notificationFilter.value === filter ? { name: "", color: "" } : filter),
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
            filtered.unshift(notification);
        } else {
            others.unshift(notification);
        }
    });
    return [...filtered, ...others].slice(0, 50); // Limit to the last 50 notifications DEFAULT, higher number will slow down the UI
}

const ClearNotifications = () =>
{
    return Widget.Button({
        class_name: "clear button",
        label: "Clear",
        on_clicked: async () => await Notifications.clear(),
    })
}

const separator = Widget.Separator({ vertical: false });


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
                    .map(notification =>
                    {
                        // Limit to the last 100 notifications after sorting
                        return Widget.EventBox(
                            {
                                class_name: "notification-event",
                                on_primary_click: () => Utils.execAsync(`wl-copy "${notification.body}"`).catch(err => print(err)),
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
        spacing: 5,
        children: [Waifu(), Resources(), Options(), ClearNotifications(), NotificationsDisplay()],
    })
}

export async function RightPanel(monitor = 0)
{
    return Widget.Window({
        monitor,
        name: `right-panel`,
        class_name: "",
        anchor: ["right", "top", "bottom"],
        exclusivity: "exclusive",
        layer: "bottom",
        keymode: "on-demand",
        // margins: [10, 0, 0, 0],
        visible: rightPanelVisibility.bind(),
        // visible: true,
        child: Panel(),
    })
}