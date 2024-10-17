import brightness from "brightness";
import { barLock, rightPanelVisibility, waifuVisibility } from "variables";
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
    function getIcon()
    {
        return Utils.execAsync(['bash', '-c', '$HOME/.config/hypr/theme/scripts/system-theme.sh get']).then(theme => theme.includes('dark') ? "" : "")
    }

    return Widget.ToggleButton({
        on_toggled: (self) =>
        {
            openProgress()
            Utils.execAsync(['bash', '-c', '$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch']).then(() => self.label = self.label == "" ? "" : "")
                .finally(() => closeProgress())
                .catch(err => Utils.notify(err))
        },

        label: "",
        class_name: "theme icon",
        setup: (self) => getIcon().then(icon => self.label = icon)
    })

}

function Brightness()
{
    const slider = Widget.Slider({
        class_name: "slider",
        hexpand: true,
        draw_value: false,
        on_change: self => brightness.screen_value = self.value,
        value: brightness.bind('screen_value' as any),
    });

    const label = Widget.Label({
        class_name: "icon",
        label:
            brightness.bind('screen_value').as(v =>
            {
                `${Math.round(v * 100)}%`
                switch (true) {
                    case v > 0.75:
                        return "󰃠";
                    case v > 0.5:
                        return "󰃟";
                    case v > 0:
                        return "󰃞";
                    default:
                        return "";
                }
            }),
    });

    return brightness.screen_value == 0 ? Widget.Box() : custom_revealer(label, slider);
}

function Volume()
{
    const icons = {
        75: "",
        50: "",
        25: "",
        0: "",
    };

    function getIcon()
    {
        if (audio.speaker.is_muted) {
            return icons[0]; // Return mute icon
        }

        const volumeLevel: number = [75, 50, 25, 0].find(
            (threshold) => threshold <= audio.speaker.volume * 100
        ) ?? 0;  // If find() returns undefined, default to 0

        return icons[volumeLevel];
    }


    const label = Widget.Label({
        class_name: "icon",
        label: Utils.watch(getIcon(), audio.speaker, getIcon)
    })

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        class_name: "slider",
        on_change: ({ value }) => (audio.speaker.volume = value),
    }).hook(audio.speaker, (self) =>
    {
        self.value = audio.speaker.volume || 0;
    });

    return custom_revealer(label, slider, '', () => Utils.execAsync(`pavucontrol`).catch(err => print(err)));
}

function BatteryLabel()
{
    const value: any = battery.bind("percent").as((p) => (p > 0 ? p / 100 : 0));

    const label = Widget.Label({
        class_name: "icon",
        label: battery.bind("percent").as((p) =>
        {
            switch (true) {
                case p == 100:
                    return "";
                case p > 75:
                    return "";
                case p > 50:
                    return "";
                case p > 25:
                    return "";
                case p > 10:
                    return "";
                case p > 0:
                    return "";
                default:
                    return "";
            }
        }),
    });

    const slider = Widget.LevelBar({
        class_name: "slider",
        widthRequest: 69,
        value,
    });

    return battery.percent <= 0 ? Widget.Box() : custom_revealer(label, slider);
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

function PinBar()
{
    return Widget.ToggleButton({
        active: barLock.value,
        onToggled: (self) =>
        {
            barLock.value = self.active
            self.label = self.active ? "" : "";
        },
        class_name: "panel-trigger icon",
        label: barLock.value ? "" : "",
    })
}

function RightPanel()
{
    return Widget.ToggleButton({
        onToggled: ({ active }) => rightPanelVisibility.value = active,
        class_name: "panel-trigger icon",
    }).hook(rightPanelVisibility, (self) =>
    {
        self.active = rightPanelVisibility.value
        self.label = rightPanelVisibility.value ? "" : ""
    }, "changed");
}

export function Right()
{
    return Widget.Box({
        class_name: "bar-right",
        hpack: "end",
        spacing: 5,
        children: [
            BatteryLabel(),
            Brightness(),
            Volume(),
            SysTray(),
            Theme(),
            PinBar(),
            RightPanel(),
        ],
    });
}