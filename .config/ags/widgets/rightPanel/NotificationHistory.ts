import { timeout } from "types/utils/timeout";
import { Notification_ } from "./components/notification";
import { Notification } from "types/service/notifications"

const Notifications = await Service.import("notifications")

interface Filter
{
    name: string
    class: string
}

const notificationFilter = Variable<Filter>({ name: "", class: "" });


export default () =>
{

    function Filter()
    {
        const Filters: Filter[] = [{
            name: "Spotify",
            class: "spotify",
        }, {
            name: "Clipboard",
            class: "clipboard",
        }, {
            name: "Update",
            class: "update",
        }];

        return Widget.Box({
            class_name: "filter",
            hexpand: false,
            children: Filters.map(filter =>
            {
                return Widget.Button({
                    label: filter.name,
                    hexpand: true,
                    on_clicked: () => notificationFilter.value = (notificationFilter.value === filter ? { name: "", class: "" } : filter),
                    class_name: notificationFilter.bind().as(filter => filter.class),
                })
            })
        })
    }


    function FilterNotifications(notifications: Notification[], filter: string): any[]
    {
        const MAX_NOTIFICATIONS = 50;

        const filtered: Notification[] = [];
        const others: Notification[] = [];

        notifications.forEach((notification: Notification) =>
        {
            if (notification.app_name.includes(filter) || notification.summary.includes(filter)) {
                filtered.unshift(notification);
            } else {
                others.unshift(notification);
            }
        });

        // Combine filtered and others
        const combinedNotifications = [...filtered, ...others];

        // Notifications to keep
        const keptNotifications = combinedNotifications.slice(0, MAX_NOTIFICATIONS);

        // Close notifications outside the kept 33
        combinedNotifications.slice(MAX_NOTIFICATIONS).forEach((notification: Notification) =>
        {
            notification.close();
        });
        return keptNotifications; // Limit to the last 50 notifications DEFAULT, higher number will slow down the UI
    }

    const NotificationHistory = () => Widget.Box({
        vertical: true,
        spacing: 5,
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

    const NotificationsDisplay = Widget.Scrollable({
        hscroll: 'never',
        vexpand: true,
        child: NotificationHistory(),
    })

    const ClearNotifications = () =>
    {
        return Widget.Button({
            class_name: "clear",
            label: "Clear",
            on_clicked: () =>
            {
                // NotificationsDisplay.child.destroy()
                // setTimeout(() => Notifications.clear(), 500)
                Notifications.clear()

                // NotificationsDisplay.child = NotificationHistory()
            },
        })
    }

    return Widget.Box({
        class_name: "notification-history",
        vertical: true,
        children: [Filter(), NotificationsDisplay, ClearNotifications()],
    })
}
