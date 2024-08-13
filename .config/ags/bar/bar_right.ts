import brightness from "brightness";

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");

function Slider(trigger, revealer)
{
    return Widget.Slider({
        class_name: "slider",
        hexpand: true,
        draw_value: false,
        on_change: self => brightness.screen_value = self.value,
        value: brightness.bind('screen-value'),
    });
}


// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Theme()
{

    function icon()
    {
        const theme: any = Utils.exec(['bash', '-c', '/home/ayman/.config/hypr/theme/scripts/system-theme.sh get'])

        return theme as string == "dark" ? "" : ""
    }

    return Widget.Button({
        on_clicked: async (self) =>
        {
            Utils.subprocess(['bash', '-c', '$HOME/.config/hypr/theme/scripts/switch-global-theme.sh'])
            await new Promise(resolve => setTimeout(resolve, 500)); // Sleep for 2 seconds
            self.child.label = icon()
        },
        child: Widget.Label({
            label: icon(),
        }),
        class_name: "theme button",
    })

}


function Brightness()
{


    const slider = Widget.Slider({
        class_name: "slider",
        hexpand: true,
        draw_value: false,
        on_change: self => brightness.screen_value = self.value,
        value: brightness.bind('screen-value'),
    });

    const label = Widget.Label({
        class_name: "label",

        label: "󰃞",
        // brightness.bind('screen-value').as(v => `${Math.round(v * 100)}%`),
    });

    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: slider,
    });

    const eventBox = Widget.EventBox({
        class_name: "brightness button",
        vexpand: false,
        hexpand: false,
        on_hover: async (self) =>
        {
            revealer.reveal_child = true
            await new Promise(resolve => setTimeout(resolve, 5000));
            revealer.reveal_child = false
        },
        on_hover_lost: async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 2000));
            revealer.reveal_child = false
        },
        child: Widget.Box({
            children: [label, revealer],
        }),
    });

    eventBox.connect('leave-notify-event', (_, event) =>
    {
        // this works :)
    });

    return eventBox;
}


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
        icon: Utils.watch(getIcon(), audio.speaker, getIcon)

    })

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        class_name: "slider",
        on_change: ({ value }) => (audio.speaker.volume = value),
        setup: (self) =>
            self.hook(audio.speaker, () =>
            {
                self.value = audio.speaker.volume || 0;
            }),
    })

    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: slider,
    });

    const trigger = Widget.Button({
        on_hover: () => revealer.reveal_child = true,
        on_hover_lost: async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 2000));
            revealer.reveal_child = false
        },
        child: icon,
    });

    return Widget.Box({
        class_name: "volume",
        children: [trigger, revealer],
    });
}

function BatteryLabel()
{
    const value = battery.bind("percent").as((p) => (p > 0 ? p / 100 : 0));
    const icon = battery
        .bind("percent")
        .as((p) => `battery-level-${Math.floor(p / 10) * 10}-symbolic`);

    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: Widget.LevelBar({
            widthRequest: 69,
            vpack: "center",
            value,
        }),
    });

    const trigger = Widget.Button({
        on_hover: () => revealer.reveal_child = true,
        on_hover_lost: async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 2000));
            revealer.reveal_child = false
        },
        child: Widget.Icon({ icon }),
    });

    return Widget.Box({
        visible: battery.bind("available"),
        class_name: "battery",
        children: [trigger, revealer],
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
                class_name: "button"
            })
        )
    );

    return Widget.Box({
        children: items,
        class_name: "system-tray",
    });
}


export function Right()
{
    return Widget.Box({
        hpack: "end",
        spacing: 8,
        children: [
            Theme(),
            Brightness(),
            Volume(),
            BatteryLabel(),
            SysTray()],
    });
}