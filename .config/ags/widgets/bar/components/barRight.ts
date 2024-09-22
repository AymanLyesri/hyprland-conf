import brightness from "brightness";
import { waifuPath, waifuVisibility } from "variables";
import { closeProgress, openProgress } from "widgets/Progress";
import { custom_revealer } from "widgets/revealer";

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const SystemTray = await Service.import("systemtray");


// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Theme()
{
    return Widget.ToggleButton({
        on_toggled: (self) =>
        {
            openProgress()
            Utils.execAsync(['bash', '-c', '$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch']).then(() => self.label = self.active ? "" : "")
                .finally(() => closeProgress())
        },

        label: "",
        class_name: "theme",
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
        class_name: "icon",
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

    return custom_revealer(icon, slider, '', () => Utils.execAsync(`pavucontrol`).catch(err => print(err)));
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
    const items = SystemTray.bind("items").as((items) =>
        items.map((item) =>
            Widget.Button({
                child: Widget.Icon({ icon: item.bind("icon") }),
                on_primary_click: (_, event) => item.activate(event),
                on_secondary_click: (_, event) => item.openMenu(event),
                on_middle_click: (_, event) => item.secondaryActivate(event),
                tooltip_markup: item.bind("tooltip_markup"),
            })
        )
    );

    return Widget.Box({
        children: items,
        class_name: "system-tray",
    });
}

function RightPanel()
{
    return Widget.ToggleButton({
        onToggled: ({ active }) => active ? App.openWindow("right-panel") : App.closeWindow("right-panel"),
        label: "",
        class_name: "panel-trigger",
    });
}

function Waifu()
{
    return Widget.ToggleButton({
        onToggled: ({ active }) => { waifuVisibility.value = active },
        label: "󰬄",
        class_name: "waifu",
        setup: (self) =>
        {
            self.hook(waifuVisibility, () => self.active = waifuVisibility.value, "changed");
        }
    })
}


export function Right()
{
    return Widget.Box({
        class_name: "bar-right",
        hpack: "end",
        spacing: 5,
        children: [
            Brightness(),
            Volume(),
            SysTray(),
            Theme(),
            BatteryLabel() as any,
            Waifu(),
            RightPanel(),
        ],
    });
}