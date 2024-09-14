export function custom_revealer(trigger, slider, custom_class = '', on_primary_click = () => { })
{
    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: slider,
    });

    const eventBox = Widget.EventBox({
        class_name: "button custom-revealer " + custom_class,
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
