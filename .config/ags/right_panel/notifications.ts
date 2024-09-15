import { Notification } from "./notification"

const notifications = await Service.import("notifications")

notifications.popupTimeout = 3000;
notifications.forceTimeout = false;
notifications.cacheActions = false;
notifications.clearDelay = 100;


export async function NotificationPopups(monitor = 0)
{
    const list = Widget.Box({
        vertical: true,
        spacing: 10,
        children: notifications.popups.map(n => Notification(n, true)),
    })

    async function onNotified(_, /** @type {number} */ id)
    {
        const n = notifications.getNotification(id)
        if (n) {
            list.children = [Notification(n, true, true), ...list.children.map(n => Notification(notifications.getNotification(n.attribute.id), false, true))]
        }
    }

    async function onDismissed(_, /** @type {number} */ id)
    {
        const notification = list.children.find(n => n.attribute.id === id)

        notification?.destroy()
    }

    list.hook(notifications, onNotified, "notified")
        .hook(notifications, onDismissed, "dismissed")

    return Widget.Window({
        monitor,
        name: `notifications`,
        class_name: "notification-popups",
        anchor: ["top", "right"],
        layer: "top",
        exclusivity: "normal",
        margins: [10, 10, 10, 10],
        child: Widget.Box({
            css: "min-width: 2px; min-height: 2px;",
            class_name: "notifications",
            vertical: true,
            child: list,
            // margin: 10,

            /** this is a simple one liner that could be used instead of
                hooking into the 'notified' and 'dismissed' signals.
                but its not very optimized becuase it will recreate
                the whole list everytime a notification is added or dismissed */
            // children: notifications.bind('popups')
            //     .as(popups => popups.map(Notification))
        }),
    })
}