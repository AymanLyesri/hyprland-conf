import { globalTransition } from "variables";

export function custom_revealer(trigger, slider, custom_class = '', on_primary_click = () => { }, vertical = false)
{
    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: globalTransition,
        transition: vertical ? 'slide_up' : 'slide_right',
        child: slider,
    });

    const eventBox = Widget.EventBox({
        class_name: "custom-revealer button" + custom_class,
        on_hover: async (self) =>
        {
            revealer.reveal_child = true
        },
        on_hover_lost: async () =>
        {
            revealer.reveal_child = false
        },
        on_primary_click: on_primary_click,
        child: Widget.Box({
            vertical: vertical,
            children: [trigger, revealer],
        }),
    });

    return eventBox;
}
