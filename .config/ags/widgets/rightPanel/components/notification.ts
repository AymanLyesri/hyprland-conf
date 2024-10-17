import { Notification } from "types/service/notifications"
import { readJson } from "utils/json"

import { timeout } from "resource:///com/github/Aylur/ags/utils.js";
import { globalTransition } from "variables";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0";

const Hyprland = await Service.import('hyprland')
const notifications = await Service.import("notifications")

const TRANSITION = 200;


/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function NotificationIcon({ app_entry, app_icon, image })
{
    if (image) {
        return Widget.Box({
            css: `background-image: url("${image}");`
                + "background-size: cover;"
                + "background-repeat: no-repeat;"
                + "background-position: center;"
            // + `box-shadow: 0 0 5px 0 ${getDominantColor(image)};`
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
    const expand = Widget.ToggleButton({
        hpack: "end",
        vpack: "end",
        class_name: "expand",
        on_toggled: (self) =>
        {
            title.truncate = self.active ? "none" : "end"
            body.truncate = self.active ? "none" : "end"
            self.label = self.active ? "" : ""
        },
        label: "",
    })

    let timeoutId;

    const lock = Widget.ToggleButton({
        class_name: "lock",
        label: "",
        on_toggled: ({ active }) =>
        {
            Revealer.attribute.locked = active;

            // If there is an existing timeout, clear it when the button is clicked again
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;  // Reset timeout ID
            }

            if (!Revealer.attribute.locked) {
                timeoutId = setTimeout(() =>
                {
                    Revealer.reveal_child = false;
                    Parent.destroy();
                    timeoutId = null;  // Clear timeout ID after execution
                }, notifications.popupTimeout);
            }
        }
    });


    const copy = Widget.Button({
        class_name: "copy",
        label: "",
        on_clicked: () => Utils.execAsync(`wl-copy "${n.body}"`).catch(err => print(err)),
    })

    const leftRevealer = Widget.Revealer({
        reveal_child: false,
        transition: "slide_left",
        transition_duration: globalTransition,
        setup: (self) => self.child = popup ? lock : copy
    })

    const closeRevealer = Widget.Revealer({
        reveal_child: false,
        transition: "slide_right",
        transition_duration: globalTransition,
        child: Widget.Button({
            class_name: "close",
            label: "",
            on_clicked: () =>
            {
                Revealer.reveal_child = false;
                timeout(TRANSITION, () => { n.close(); Revealer.destroy() })
            },
        }),
    })

    const Box = Widget.Box(
        {
            class_name: `notification ${n.urgency} ${n.app_name}`,
        },
        leftRevealer,
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
                                children: popup ? [title] : [title, expand],
                            }),
                            body
                        ),
                    ]
                }),
                Actions]
        }),
        closeRevealer

    )


    const Revealer = Widget.Revealer({
        attribute: {
            id: n.id,
            locked: false,
            hide: () => Revealer.reveal_child = false,

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

    const Parent = Widget.Box({
        visible: true,
        css: "padding:1px;",
        child: Widget.EventBox({
            visible: true,
            child: Revealer,
            on_hover: () =>
            {
                leftRevealer.reveal_child = true
                closeRevealer.reveal_child = true
            },
            on_hover_lost: () =>
            {
                if (!Revealer.attribute.locked) leftRevealer.reveal_child = false
                closeRevealer.reveal_child = false
            },

            on_primary_click: () => leftRevealer.child.activate(),
            on_secondary_click: () => closeRevealer.child.activate(),
        })
    })

    return Parent
}