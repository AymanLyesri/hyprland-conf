import { HyprlandSettings } from "interfaces/hyprlandSettings.interface"
import { getSetting, globalSettings, setSetting } from "utils/settings";
import { globalMargin } from "variables"





// const hyprlandSettings = Variable<HyprlandSettings>({
//     decorations: {
//         active_opacity: 0.5,
//         inactive_opacity: 0.1,
//     }
// })
// hyprlandSettings.connect("changed", ({ value }) => Utils.notify(`hyprlandSettings changed: ${JSON.stringify(value)}`));

// function updateSetting(key: string, newValue: any)
// {
//     // Function to update the hyprlandSettings object dynamically
//     const keys = key.split(".");
//     let obj = hyprlandSettings.value;
//     for (let i = 0; i < keys.length - 1; i++) {
//         obj = obj[keys[i]];
//     }
//     obj[keys[keys.length - 1]] = newValue;
//     hyprlandSettings.value = obj;
// }

const hyprCustomDir: string = '$HOME/.config/hypr/configs/custom/'

const Setting = (key: string, value: number) =>
{
    const keys = key.split('.')
    return Widget.Box({
        class_name: "setting",
        children: [
            Widget.Label({
                hpack: "start",
                hexpand: true,
                class_name: "",
                label: keys[2].charAt(0).toUpperCase() + keys[2].slice(1),
            }),
            Widget.Slider({
                hpack: "end",
                draw_value: false,
                width_request: 169,
                hexpand: true,
                class_name: "slider",
                value: globalSettings.bind().as(s => getSetting(key)),
                on_change: ({ value }) =>
                {
                    setSetting(key, value)
                    print(`bash -c "echo -e '${keys[1]} { \n\t${keys[2]}=${value} \n}' >${hyprCustomDir + keys[2]}.conf"`)
                    Utils.execAsync(`bash -c "echo -e '${keys[1]} { \n\t${keys[2]}=${value} \n}' >${hyprCustomDir + keys[2]}.conf"`)
                        .catch(err => Utils.notify(err))
                },
            }),
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
                    // settings.push(Setting(value));
                    // If the value is an object, loop through its properties
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
        visible: false,
        margins: [globalMargin, globalMargin],
        child: Settings(),
    })
}