import { globalTransition } from "variables";

export function custom_revealer(trigger, slider, custom_class = '', on_primary_click = () => { })
{
    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: globalTransition,
        transition: 'slide_right',
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
            children: [trigger, revealer],
        }),
    });

    return eventBox;
}
