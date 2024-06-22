
const audio = await Service.import("audio");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");


// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Volume()
{
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    };

    function getIcon()
    {
        const icon: any = audio.speaker.is_muted
            ? 0
            : [101, 67, 34, 1, 0].find(
                (threshold) => threshold <= audio.speaker.volume * 100
            );

        return `audio-volume-${icons[icon]}-symbolic`;
    }

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    });

    const slider = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_down',
        child:
            Widget.Slider({
                hexpand: true,
                draw_value: false,
                on_change: ({ value }) => (audio.speaker.volume = value),
                setup: (self) =>
                    self.hook(audio.speaker, () =>
                    {
                        self.value = audio.speaker.volume || 0;
                    }),
            }),
    });

    return Widget.Box({
        class_name: "volume",
        css: "min-width: 180px",
        children: [icon, slider],
    });
}

function BatteryLabel()
{
    const value = battery.bind("percent").as((p) => (p > 0 ? p / 100 : 0));
    const icon = battery
        .bind("percent")
        .as((p) => `battery-level-${Math.floor(p / 10) * 10}-symbolic`);

    return Widget.Box({
        class_name: "battery",
        visible: battery.bind("available"),
        children: [
            Widget.Icon({ icon }),
            Widget.LevelBar({
                widthRequest: 140,
                vpack: "center",
                value,
            }),
        ],
    });
}

function SysTray()
{
    const items = systemtray.bind("items").as((items) =>
        items.map((item) =>
            Widget.Button({
                child: Widget.Icon({ icon: item.bind("icon") }),
                on_primary_click: (_, event) => item.activate(event),
                on_secondary_click: (_, event) => item.openMenu(event),
                tooltip_markup: item.bind("tooltip_markup"),
            })
        )
    );

    return Widget.Box({
        children: items,
    });
}


export function Right()
{
    return Widget.Box({
        hpack: "end",
        spacing: 8,
        children: [Volume(), BatteryLabel(), SysTray()],
    });
}