import { globalMargin, globalTransition, rightPanelExclusivity } from "variables";
import { Notification_ } from "./rightPanel/components/notification"
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";

const notifications = await Service.import("notifications")

notifications.popupTimeout = 3000;
notifications.forceTimeout = false;
notifications.cacheActions = false;
// notifications.clearDelay = 100;




const Notification = (notification, new_n) => Widget.EventBox({
    attribute: {
        locked: false,
        id: notification.id,
    },
    visible: true,
    child: Notification_(notification, new_n),
    on_primary_click: (self) =>
    {
        self.attribute.locked = true
        self.child.attribute.lock()
    },
})


const list = Widget.Box({
    vertical: true,
    children: notifications.popups.map(id => Notification(id, true)),
}).hook(notifications, onNotified, "notified").hook(notifications, onDismissed, "dismissed") // it bugs when clear is triggered


function onNotified(_, /** @type {number} */ id)
{
    const n = notifications.getNotification(id)
    if (n) {
        list.pack_end(Notification(n, true), false, false, 0);

        timeout(notifications.popupTimeout, () => onDismissed(null, id))
    }
}

function onDismissed(_, /** @type {number} */ id)
{
    const notification = list.children.find(n => n.attribute.id === id)

    if (!notification || notification.attribute.locked) return;

    notification.child.attribute.hide() as any

    timeout(200, () => notification?.destroy())
}

export default () =>
{
    return Widget.Window({
        name: `notifications`,
        class_name: "notification-popups",
        anchor: rightPanelExclusivity.bind().as(exclusive => exclusive ? ["right", "top"] : ["left", "top"]),
        layer: "top",
        exclusivity: "normal",
        margins: [5, globalMargin, globalMargin, globalMargin],
        child: Widget.Box({
            css: "min-width: 2px; min-height: 2px;",
            class_name: "notifications",
            vertical: true,
            child: list,
        }),
    })
}