import brightness from "brightness";
import { rightPanelVisibility } from "variables";

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");

function Notifications()
{
    return Widget.Button({
        on_clicked: () => rightPanelVisibility.value = !rightPanelVisibility.value,
        label: "",
        class_name: "module button",
    });
}

function custom_revealer(trigger, slider, on_primary_click = () => { })
{
    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: slider,
    });

    const eventBox = Widget.EventBox({
        class_name: "button custom-slider",
        on_hover: async (self) =>
        {
            revealer.reveal_child = true
        },
        on_hover_lost: async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 2000));
            revealer.reveal_child = false
        },
        on_primary_click: on_primary_click,
        child: Widget.Box({
            children: [trigger, revealer],
        }),
    });

    return eventBox;
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

    // return Widget.Switch({
    //     class_name: "switch",
    //     onActivate: (state) => { Utils.execAsync(['bash', '-c', '$HOME/.config/hypr/theme/scripts/switch-global-theme.sh']) },
    // })

    return Widget.Button({
        on_clicked: async (self) =>
        {
            Utils.subprocess(['bash', '-c', '$HOME/.config/hypr/theme/scripts/switch-global-theme.sh'])
            // await new Promise(resolve => setTimeout(resolve, 500)); // Sleep for 2 seconds
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
        value: brightness.bind('screen-value' as any),
    });

    const label = Widget.Label({
        class_name: "label",
        label: "󰃞",
        // brightness.bind('screen-value').as(v => `${Math.round(v * 100)}%`),
    });

    return custom_revealer(label, slider);
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
        class_name: "icon",
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

    return custom_revealer(icon, slider, () => Utils.execAsync(`pavucontrol`));
}

function BatteryLabel()
{
    const value: any = battery.bind("percent").as((p) => (p > 0 ? p / 100 : 0));
    const battery_icon = battery
        .bind("percent")
        .as((p) => `battery-level-${Math.floor(p / 10) * 10}-symbolic`);

    const icon = Widget.Icon({
        icon: battery_icon,
        class_name: "icon",
    });

    const slider = Widget.LevelBar({
        class_name: "slider",
        widthRequest: 69,

        value,
    });

    return value == 0 ? custom_revealer(icon, slider) : null;
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
        spacing: 5,
        children: [
            Notifications(),
            SysTray(),
            Theme(),
            Brightness(),
            Volume(),
            BatteryLabel() as any,
        ],
    });
}