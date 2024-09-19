
import { getDominantColor } from "utils/image"

const notifications = await Service.import("notifications")


/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function NotificationIcon({ app_entry, app_icon, image })
{
    if (image) {
        return Widget.Box({
            css: `background-image: url("${image}");`
                + "background-size: contain;"
                + "background-repeat: no-repeat;"
                + "background-position: center;"
                + `box-shadow: 0 0 5px 0 ${getDominantColor(image)};`
        })
    }

    let icon = "dialog-information-symbolic"
    if (Utils.lookUpIcon(app_icon))
        icon = app_icon

    if (app_entry && Utils.lookUpIcon(app_entry))
        icon = app_entry

    return Widget.Box({
        child: Widget.Icon(icon),
    })
}

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
export function Notification(n, new_Notification = false, popup = false)
{
    const icon = Widget.Box({
        vpack: "center",
        hpack: "center",
        class_name: "icon",
        child: NotificationIcon(n),
    })

    const title = Widget.Label({
        class_name: "title",
        xalign: 0,
        justification: "left",
        hexpand: true,
        max_width_chars: 24,
        truncate: "end",
        wrap: true,
        label: n.summary,
        use_markup: true,
    })

    const body = Widget.Label({
        class_name: "body",
        hexpand: true,
        use_markup: true,
        truncate: popup ? "none" : "end",
        xalign: 0,
        justification: "left",
        label: n.body,
        wrap: true,
    })

    const actions = Widget.Box({
        class_name: "actions",
        children: n.actions.map(({ id, label }) => Widget.Button({
            class_name: "action-button",
            on_clicked: () =>
            {
                n.invoke(id)
                n.dismiss()
            },
            hexpand: true,
            child: Widget.Label(label),
        })),
    })

    const close = Widget.Button({
        class_name: "close",
        on_clicked: async () => n.close(),
        child: Widget.Icon("window-close-symbolic"),
    })

    return Widget.EventBox(
        {
            attribute: { id: n.id },
            on_primary_click: n.dismiss,
        },
        Widget.Box(
            {
                class_name: `notification ${n.urgency} ${n.app_name}`,
                css: new_Notification ? "animation: background-pop 0.5s ease;" : "",
                vertical: true,
            },
            Widget.Box([
                icon,
                Widget.Box(
                    { vertical: true },
                    Widget.Box({
                        hexpand: true,
                        children: popup ? [title] : [title, close],
                    }),
                    body,
                ),
            ]),
            actions,
        ),
    )
}