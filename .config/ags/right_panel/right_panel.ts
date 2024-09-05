import { Waifu } from "widgets/waifu";
import { Notification } from "./notification";

const notifications = await Service.import("notifications")
notifications.popupTimeout = 3000;
// notifications.forceTimeout = false;
// notifications.cacheActions = false;
// notifications.clearDelay = 100;

function Notifications()
{
    return notifications.bind("notifications").as(n =>
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
                    child: Notification(notification),
                },

            );
        })
    })
}

function Panel()
{
    return Widget.Box({
        class_name: "right-panel",
        vertical: true,
        children: [Waifu(), Widget.Scrollable({
            class_name: "notification-history",
            hscroll: 'never',
            vexpand: true,
            child: Widget.Box({ vertical: true, children: Notifications() })
        })]
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
        layer: "top",
        // margins: [10, 0, 0, 0],
        visible: false,
        child: Panel(),
    })
}