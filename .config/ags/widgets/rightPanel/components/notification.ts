import { Util } from "types/@girs/atk-1.0/atk-1.0.cjs"
import { Notification } from "types/service/notifications"
import { getDominantColor } from "utils/image"
import { readJson } from "utils/json"

import { timeout } from "resource:///com/github/Aylur/ags/utils.js";
import { globalTransition } from "variables";

const Hyprland = await Service.import('hyprland')

const TRANSITION = 200;


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
export function Notification_(n: Notification, new_Notification = false, popup = false)
{
    const icon = Widget.Box({
        vpack: "start",
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
        // truncate: "end",
        wrap: true,
        label: n.summary,
        use_markup: true,
    })

    const body = Widget.Label({
        class_name: "body",
        hexpand: true,
        use_markup: true,
        truncate: popup ? "none" : "end",
        max_width_chars: 24,
        xalign: 0,
        justification: "left",
        label: n.body,
        wrap: true,
    })

    const actions: string[][] = n.hints.actions ? readJson(n.hints.actions.get_string()[0]) : [];

    const Actions = Widget.Box({
        class_name: "actions",
        // hpack: "fill",
        children: actions.map((action) => Widget.Button({
            class_name: action[0].includes("Delete") ? "delete" : "",
            // hpack: action[0].includes("Delete") ? "end" : "fill",
            on_clicked: () =>
            {
                Hyprland.messageAsync(`dispatch exec ${action[1]}`).catch((err) => Utils.notify(err))
            },
            hexpand: true,
            child: Widget.Label(action[0].includes("Delete") ? "󰆴" : action[0]),
        })
        ),
    });


    // const actions = Widget.Box({
    //     class_name: "actions",
    //     children: n.actions.map(({ id, label }) => Widget.Button({
    //         on_clicked: () =>
    //         {
    //             const [command, action] = label.split(':');
    //             Hyprland.messageAsync(`dispatch exec ${command}`).then(() => Utils.execAsync('killall notify-send'))

    //             // n.invoke(id)

    //         },
    //         hexpand: true,
    //         child: Widget.Label(label.split(':')[1]),
    //     })),
    // })

    const close = Widget.Button({
        hpack: "end",
        vpack: "start",
        class_name: "close",
        on_clicked: async () =>
        {
            Revealer.reveal_child = false;
            timeout(TRANSITION, () => { n.close(); Revealer.destroy() })
        },
        label: "",
    })

    const expand = Widget.ToggleButton({
        hpack: "end",
        vpack: "end",
        class_name: "expand",
        on_toggled: (self) =>
        {
            body.truncate = self.active ? "none" : "end"
            self.label = self.active ? "" : ""
        },
        label: "",
    })

    const lockRevealer = Widget.Revealer({
        reveal_child: false,
        transition: "slide_left",
        transition_duration: globalTransition,
        child: Widget.Button({
            class_name: "lock",
            label: "",
            on_primary_click: () => Revealer.reveal_child = false,
        }),
    })

    const Box = Widget.Box(
        {
            class_name: `notification ${n.urgency} ${n.app_name}`,
        },
        lockRevealer,
        Widget.Box({
            class_name: "main-content",
            vertical: true,
            children: [
                Widget.Box({
                    children: [
                        icon,
                        Widget.Box(
                            {
                                vertical: true,
                                spacing: 5,
                            },
                            Widget.Box({
                                hexpand: true,
                                children: popup ? [title] : [title, close],
                            }),
                            Widget.Box({
                                hexpand: true,
                                children: popup ? [body] : [body, expand],
                            })
                        ),
                    ]
                }),
                Actions]
        }),

    )


    const Revealer = Widget.Revealer({
        attribute: {
            id: n.id,
            hide: () =>
            {
                Revealer.reveal_child = false;
            },
            lock: () => lockRevealer.reveal_child = true,

        },
        child: Box,
        transition: "slide_down",
        transition_duration: TRANSITION,
        reveal_child: !new_Notification,
        visible: true, // this is necessary for the revealer to work
        setup: (self) =>
        {
            timeout(1, () =>
            {
                self.reveal_child = true;
            });
        }
    })

    return Revealer
}