
import { Notification } from "./components/notification";
import { Resources } from "widgets/Resources";
import waifu from "./components/waifu";
import { rightPanelExclusivity } from "variables";

const Notifications = await Service.import("notifications")
// notifications.popupTimeout = 3000;
// notifications.forceTimeout = false;
// notifications.cacheActions = false;
// notifications.clearDelay = 100;

function WindowActions()
{
    return Widget.Box({
        class_name: "window-actions",
        hpack: "end", spacing: 5
    },
        Widget.Button({
            label: "󰐃",
            class_name: "button exclusivity",
            on_clicked: () =>
            {
                rightPanelExclusivity.value = rightPanelExclusivity.value === "normal" ? "exclusive" : "normal"
            },
        }),
        Widget.Button({
            label: "",
            class_name: "button close",
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

function Options()
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
        class_name: "options",
        hexpand: false,
        children: Filters.map(filter =>
        {
            return Widget.Button({
                label: filter.name,
                hexpand: true,
                on_clicked: () => notificationFilter.value = (notificationFilter.value === filter ? { name: "", color: "" } : filter),
                class_name: "module button",
                css: notificationFilter.bind().as(filter => `background: ${filter.color}`),
            });
        })
    })
}


const ClearNotifications = () =>
{
    return Widget.Button({
        class_name: "clear button",
        label: "Clear",
        on_clicked: async () =>
        {
            NotificationsDisplay.child = Widget.Box({
                vertical: true,
                children: [],
            });
            Notifications.clear().then(() => NotificationsDisplay.child = NotificationHistory());
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
                        child: Notification(notification),
                    });
            })
    }),
})

// const separator = Widget.Separator({ vertical: false });

const NotificationsDisplay = Widget.Scrollable({
    class_name: "notification-history",
    hscroll: 'never',
    vexpand: true,
    child: NotificationHistory(),
})


function Panel()
{
    return Widget.Box({
        vertical: true,
        // spacing: 5,
        children: [WindowActions(), waifu(), Resources(), Options(), NotificationsDisplay, ClearNotifications()],
    })
}

const Window = () => Widget.Window({
    name: `right-panel`,
    class_name: "right-panel",
    anchor: ["right", "top", "bottom"],
    exclusivity: rightPanelExclusivity.value as any,
    layer: "top",
    keymode: "on-demand",
    // margins: [10, 0, 0, 0],
    visible: false,
    child: Panel(),
    setup: (self) =>
    {
        self.hook(rightPanelExclusivity, (self) =>
        {
            self.exclusivity = rightPanelExclusivity.value as any
            self.class_name = "right-panel " + rightPanelExclusivity.value
        }, "changed");
    }
})

export default () =>
{
    return Window();
}