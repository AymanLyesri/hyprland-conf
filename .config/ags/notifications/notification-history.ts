import { Notification } from "./notification";

const notifications = await Service.import("notifications")
notifications.popupTimeout = 3000;
// notifications.forceTimeout = false;
// notifications.cacheActions = false;
// notifications.clearDelay = 100;

export function NotificationHistory(monitor = 0)
{
    return Widget.Window({
        monitor,
        name: `notification-history`,
        class_name: "",
        anchor: ["top", "right", "bottom"],
        exclusivity: "exclusive",
        layer: "overlay",
        margins: [10, 0, 0, 0],
        visible: false,
        child: Widget.Scrollable({
            class_name: "notification-history",
            hscroll: 'never',
            child: Widget.Box({
                vertical: true,
                // hexpand: false,
                hpack: "start",
                children:
                    notifications.bind("notifications").as(n =>
                    {
                        // Separate Spotify notifications and others
                        const spotifyNotifications = n.filter(notification => notification.app_name === "Spotify");
                        const otherNotifications = n.filter(notification => notification.app_name !== "Spotify");

                        // Combine Spotify notifications first, then the others
                        const sortedNotifications = [
                            ...otherNotifications,
                            ...spotifyNotifications
                        ];

                        // Limit to the last 100 notifications after sorting
                        return sortedNotifications.slice(-100).reverse().map(notification =>
                        {
                            return Widget.EventBox(
                                {
                                    class_name: "notification-event",
                                    on_primary_click: () => Utils.execAsync(`wl-copy "${notification.body}"`),
                                },
                                Notification(notification)
                            );
                        });
                    }),

                // setup: (self) =>
                // {
                //     // notifications.bind('notifications')
                //     //     .as(popups => self.children = popups.map(Notification))
                //     self.hook(notifications, () =>
                //     {
                //         // add the first notification

                //         list.push(Notification(notifications.notifications[0]));
                //         self.children = list;

                //     }, "notified")
                // }
            })
        })
    })
}