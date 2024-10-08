import { Notification_ } from "./components/notification";

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
        return [...filtered, ...others].slice(0, 33); // Limit to the last 50 notifications DEFAULT, higher number will slow down the UI
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
                NotificationsDisplay.child = Widget.Box({
                    vertical: true,
                    children: [],
                });
                Notifications.clear()
                // .finally(() => NotificationsDisplay.child = NotificationHistory())
            },
        })
    }

    return Widget.Box({
        class_name: "notification-history",
        vertical: true,
        children: [Filter(), NotificationsDisplay, ClearNotifications()],
    })
}
