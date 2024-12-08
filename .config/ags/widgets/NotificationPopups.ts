import { DND, globalMargin, globalTransition, rightPanelExclusivity } from "variables";
import { Notification_ } from "./rightPanel/components/notification"
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";
import Box from "types/widgets/box";

const notifications = await Service.import("notifications")

notifications.popupTimeout = 5000;
notifications.forceTimeout = false;
notifications.cacheActions = false;
notifications.clearDelay = 100;

const Display = () =>
{
    const list = Widget.Box({
        spacing: 10,
        vertical: true,
        children: notifications.popups.map(id => Notification_(id, true, true)),
    }).hook(notifications, onNotified, "notified").hook(notifications, onDismissed, "dismissed") // it bugs when clear is triggered


    function onNotified(_, /** @type {number} */ id)
    {
        if (DND.value) return;

        const n = notifications.getNotification(id)
        if (n) {
            list.pack_end(Notification_(n, true, true), false, false, 0);

            print("notification", n.summary, n.body, n.actions)

            timeout(notifications.popupTimeout, () => onDismissed(null, id))
        }
    }

    function onDismissed(_, /** @type {number} */ id)
    {
        const notification: any = list.children.find((n: any) => n.child.child.attribute.id === id)

        if (!notification || notification.child.child.attribute.locked) return;

        notification.child.child.attribute.hide()

        timeout(200, () => notification?.destroy())
    }

    return Widget.Box({
        css: "min-width: 2px; min-height: 2px;",
        class_name: "notifications",
        vertical: true,
        child: list,
    })
}

export default () =>
{
    return Widget.Window({
        name: `notifications`,
        class_name: "notification-popups",
        anchor: rightPanelExclusivity.bind().as(exclusive => exclusive ? ["right", "top"] : ["left", "top"]),
        layer: "top",
        exclusivity: "normal",
        margins: [7, globalMargin],
        child: Display(),
    })
}