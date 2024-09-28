import { globalMargin, rightPanelExclusivity } from "variables";
import { Notification_ } from "./components/notification"

const notifications = await Service.import("notifications")

notifications.popupTimeout = 5000;
notifications.forceTimeout = false;
notifications.cacheActions = false;
notifications.clearDelay = 100;


export default () =>
{
    const list = Widget.Box({
        vertical: true,
        spacing: 10,
        children: notifications.popups.map(n => Notification_(n, true)),
    })

    function onNotified(_, /** @type {number} */ id)
    {
        const n = notifications.getNotification(id)
        if (n) {
            list.children = [Notification_(n, true, true), ...list.children.map(n => Notification_(notifications.getNotification(n.attribute.id) as any, false, true))]

            setTimeout(() =>
            {
                let notification = list.children.find(n => n.attribute.id === id)
                notification?.destroy()

            }, notifications.popupTimeout)
        }
    }

    function onDismissed(_, /** @type {number} */ id)
    {
        const notification = list.children.find(n => n.attribute.id === id)

        notification?.destroy()
    }

    list.hook(notifications, onNotified, "notified")
        .hook(notifications, onDismissed, "dismissed") // it bugs when clear is triggered

    return Widget.Window({
        name: `notifications`,
        class_name: "notification-popups",
        anchor: rightPanelExclusivity.bind().as(exclusive => exclusive ? ["right", "top"] : ["left", "top"]),
        layer: "top",
        exclusivity: "normal",
        margins: [5, globalMargin, globalMargin, globalMargin],
        child: Widget.Box({
            class_name: "notifications",
            vertical: true,
            child: list,
        }),
    })
}