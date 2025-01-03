import { HyprlandSettings } from "interfaces/hyprlandSettings.interface"
import { getSetting, globalSettings, setSetting } from "utils/settings";
import { globalMargin, settingsVisibility } from "variables";

const Hyprland = await Service.import("hyprland");


const hyprCustomDir: string = '$HOME/.config/hypr/configs/custom/'

function buildConfigString(keys: string[], value: any): string
{
    if (keys.length === 1) return `${keys[0]}=${value}`;

    const currentKey = keys[0];
    const nestedConfig = buildConfigString(keys.slice(1), value);
    return `${currentKey} {\n\t${nestedConfig.replace(/\n/g, '\n\t')}\n}`;
}


const Setting = (keys: string, setting: HyprlandSetting) =>
{
    const keyArray = keys.split('.')
    const lastKey = keyArray.at(-1)
    if (!lastKey) return

    const title = Widget.Label({
        hpack: "start",
        class_name: "",
        label: lastKey.charAt(0).toUpperCase() + lastKey.slice(1),
    })

    const sliderWidget = () =>
    {
        const infoLabel = Widget.Label({
            hexpand: true,
            xalign: 1,
            label: `${Math.round(setting.value / (setting.max - setting.min) * 100)}%`,
        })
        const slider_ = Widget.Slider({
            hpack: "end",
            draw_value: false,
            width_request: 169,
            class_name: "slider",
            value: globalSettings.bind().as(s => getSetting(keys + ".value") / (setting.max - setting.min)),
            on_change: ({ value }) =>
            {
                infoLabel.label = `${Math.round(value * 100)}%`;
                switch (setting.type) {
                    case "int":
                        value = Math.round(value * (setting.max - setting.min));
                        break;
                    case "float":
                        value = parseFloat(value.toFixed(2)) * (setting.max - setting.min);
                        break;
                    default:
                        break;
                }

                setSetting(keys + ".value", value)
                const configString = buildConfigString(keyArray.slice(1), value);
                Utils.execAsync(`bash -c "echo -e '${configString}' >${hyprCustomDir + keyArray.at(-2) + "." + keyArray.at(-1)}.conf"`)
                    .catch(err => Utils.notify(err));
            },
        })

        return Widget.Box({
            hexpand: true,
            hpack: "end",
            spacing: 5,
            children: [
                slider_,
                infoLabel,
            ],
        }
        )
    }

    const switchWidget = () =>
    {
        const infoLabel = Widget.Label({
            hexpand: true,
            xalign: 1,
            label: `${Math.round(setting.value / (setting.max - setting.min) * 100)}%`,
        })

        const switch_ = Widget.Switch({
            active: globalSettings.bind().as(s => getSetting(keys + ".value")),
            on_activate: ({ active }) =>
            {
                infoLabel.label = active ? "On" : "Off";
                setSetting(keys + ".value", active)

                const configString = buildConfigString(keyArray.slice(1), active);
                Utils.execAsync(`bash -c "echo -e '${configString}' >${hyprCustomDir + keyArray.at(-2) + "." + keyArray.at(-1)}.conf"`)
                    .catch(err => Utils.notify(err));
            }
        })

        return Widget.Box({
            hexpand: true,
            hpack: "end",
            spacing: 5,
            children: [
                switch_,
                infoLabel,
            ],
        })
    }

    return Widget.Box({
        class_name: "setting",
        children: [
            title,
            setting.type === "bool" ? switchWidget() : sliderWidget(),
        ],
    })
}
const Settings = Widget.Box({
    vertical: true,
    spacing: 5,
    class_name: "settings",
    setup: (self) =>
    {
        const Category = (title) => Widget.Label({
            label: title
        })

        let settings: any[] = []
        function processSetting(key: string, value: any)
        {
            // Check if the current value is an object and not null
            if (typeof value === 'object' && value !== null) {
                // Add a new category to the settings based on the key
                settings.push(Category(key));

                // Iterate over the entries (key-value pairs) of the child object
                Object.entries(value).forEach(([childKey, childValue]) =>
                {
                    // Check if the childValue is an object and not null
                    if (typeof childValue === 'object' && childValue !== null) {

                        // Check if the childValue has at least one key to check for grandchildren
                        const firstKey = Object.keys(childValue)[0];

                        if (firstKey && typeof childValue[firstKey] === 'object' && childValue[firstKey] !== null) {
                            // Recursively process the childValue to check for grandchildren
                            processSetting(`${key}.${childKey}`, childValue);
                        } else {
                            // If there are no grandchildren, add a setting for the childValue
                            settings.push(Setting(`hyprland.${key}.${childKey}`, childValue as HyprlandSetting));
                        }
                    }
                });
            }
        }

        // Main logic
        Object.entries(globalSettings.value.hyprland).forEach(([key, value]) =>
        {
            processSetting(key, value);
        });

        self.children = settings
    }

})


const windowActions = Widget.Box({
    hexpand: true,
    class_name: "window-actions",
    children: [
        Widget.Box({
            hexpand: true,
            hpack: "start",
            child: Widget.Button({
                hpack: "end",
                label: "",
                on_primary_click: () =>
                {
                    settingsVisibility.value = false
                    App.closeWindow("settings")
                },
            }),
        }),
        Widget.Button({
            label: "󰑐",
            on_primary_click: () => Utils.execAsync(`bash -c "hyprctl reload"`),
        }),

    ]
})

const Display = Widget.Box({
    vertical: true,
    class_name: "settings-widget",
    children: [
        windowActions,
        Settings,
    ]
})


export default () =>
{
    return Widget.Window({
        name: `settings`,
        class_name: "",
        anchor: ["bottom", "left"],
        visible: settingsVisibility.value,
        margins: [globalMargin, globalMargin],
        child: Display,
    }).hook(settingsVisibility, (self) => self.visible = settingsVisibility.value, "changed")
}