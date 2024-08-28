const hyprland = await Service.import("hyprland");
import { timeout } from "types/utils/timeout"

export function Wallpapers(monitor = 0)
{

    const get_wallpapers: any = (self) =>
    {
        const activeId = hyprland.active.workspace.bind("id");

        var wallpapers: any[] = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh'))
        return wallpapers.map((wallpaper, key) =>
        {
            key += 1

            return Widget.Button({
                vpack: "center",
                css: `background-image: url('${wallpaper}');`,
                class_name: activeId.as((i) => `${i == key ? "workspace-wallpaper focused" : "workspace-wallpaper"}`),
                label: `${key}`,

                on_primary_click: () =>
                {
                    Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/random.sh ${key}"`)
                    setTimeout(() =>
                    {
                        let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh'))[key - 1]
                        self.children[key - 1].css = `background-image: url('${new_wallpaper}');`
                    }, 1000)
                },
                on_secondary_click: () =>
                {
                    Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/previous.sh ${key}"`)
                    setTimeout(() =>
                    {
                        let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh'))[key - 1]
                        self.children[key - 1].css = `background-image: url('${new_wallpaper}');`
                    }, 1000)
                }
            })
        })
    }

    const switcher = Widget.Box({
        hexpand: true,
        vexpand: true,
        class_name: "wallpaper-switcher",
        spacing: 10,
        setup: (self) =>
        {
            self.children = [...get_wallpapers(self), Widget.Button({
                vpack: "center",
                class_name: "button reload-wallpapers",
                label: "󰑐",
                on_primary_click: () =>
                {
                    Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"`)
                }
            })
            ]
        }
    });

    return Widget.Window({
        monitor,
        name: `wallpaper-switcher`,
        class_name: "",
        anchor: [],
        // exclusivity: "normal",
        // layer: "top",
        // margins: [0, 0, 100, 0],
        visible: false,
        child: switcher
    })
}