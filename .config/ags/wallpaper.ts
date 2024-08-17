import { timeout } from "types/utils/timeout"

export function Wallpapers(monitor = 0)
{
    var wallpapers = []

    const get_wallpapers = (self) =>
    {
        wallpapers = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh'))
        return wallpapers.map((wallpaper, key) =>
        {
            key += 1
            return Widget.Button({
                vpack: "center",
                css: `background-image: url('${wallpaper}');`,
                class_name: "workspace-wallpaper",
                label: `${key}`,

                on_primary_click: () =>
                {
                    Utils.exec(`bash -c "$HOME/.config/hypr/hyprpaper/random.sh ${key}"`)
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
        spacing: 10,
        setup: (self) =>
        {
            self.children = get_wallpapers(self)
        }
    });

    return Widget.Window({
        monitor,
        name: `wallpapers`,
        class_name: "wallpaper-switcher",
        anchor: [],
        layer: "overlay",
        // margins: [0, 0, 100, 0],
        visible: false,
        child: switcher
    })
}