import { HyprlandSettings } from "interfaces/hyprlandSettings.interface"
import { getSetting, globalSettings, setSetting } from "utils/settings";
import { globalMargin } from "variables"


const hyprCustomDir: string = '$HOME/.config/hypr/configs/custom/'

const Setting = (key: string, setting: HyprlandSetting) =>
{
    const keys = key.split('.')
    const title = Widget.Label({
        hpack: "start",
        class_name: "",
        label: keys[2].charAt(0).toUpperCase() + keys[2].slice(1),
    })
    const percentage = Widget.Label({
        hexpand: true,
        xalign: 1,
        label: `${Math.round(setting.value / (setting.max - setting.min) * 100)}%`,
    })

    const slider = Widget.Slider({
        hpack: "end",
        draw_value: false,
        width_request: 169,
        class_name: "slider",
        value: globalSettings.bind().as(s => getSetting(key + ".value") / (setting.max - setting.min)),
        on_change: ({ value }) =>
        {
            percentage.label = `${Math.round(value * 100)}%`;
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

            setSetting(key + ".value", value)
            Utils.execAsync(`bash -c "echo -e '${keys[1]} { \n\t${keys[2]}=${value} \n}' >${hyprCustomDir + keys[2]}.conf"`)
                .catch(err => Utils.notify(err))
        },
        setup: (self) => self.step = 0.01
    })

    return Widget.Box({
        class_name: "setting",
        children: [
            title,
            percentage,
            slider
        ],
    })
}

const Category = (title) => Widget.Label({
    label: title
})


const Settings = () =>
{
    return Widget.Box({
        vertical: true,
        class_name: "settings-widget",
        spacing: 5,
        setup: (self) =>
        {
            let settings: any[] = []
            // Loop through the hyprlandSettings object
            Object.keys(globalSettings.value.hyprland).forEach((key) =>
            {
                const value = globalSettings.value.hyprland[key as keyof typeof globalSettings.value.hyprland];

                if (typeof value === 'object' && value !== null) {
                    settings.push(Category(key))
                    Object.keys(value).forEach((childKey) =>
                    {
                        const childValue = value[childKey as keyof typeof value];
                        settings.push(Setting(`hyprland.${key}.${childKey}`, childValue));
                    });
                }
            });
            self.children = settings
        }

    })
}


export default () =>
{
    return Widget.Window({
        name: `settings`,
        class_name: "",
        anchor: ["bottom", "left"],
        visible: true,
        margins: [globalMargin, globalMargin],
        child: Settings(),
    })
}