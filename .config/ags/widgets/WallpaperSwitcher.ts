
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";
import { globalTransition } from "variables";

const hyprland = await Service.import("hyprland");

var selectedWorkspace = 0

function Wallpapers()
{
    const allWallpapers = () =>
    {
        const allWallpapers: any[] = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --all'))

        const Box = Widget.Box({
            class_name: "all-wallpapers",
            spacing: 5,
            children: allWallpapers.map((wallpaper, key) =>
            {
                return Widget.Button({
                    class_name: "wallpaper",
                    hexpand: true,
                    vexpand: true,
                    css: `background-image: url('${wallpaper}');`,
                    on_primary_click: () =>
                    {
                        Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace} ${wallpaper}"`)
                            .then(() => bottom.child.reveal_child = false)
                            .finally(() =>
                            {
                                let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))[selectedWorkspace - 1]
                                top.children[selectedWorkspace - 1].css = `background-image: url('${new_wallpaper}');`
                            })
                            .catch(err => Utils.notify(err));
                    }
                })
            }),
        })

        return Widget.Scrollable({
            class_name: "all-wallpapers-scrollable",
            hscroll: 'always',
            vscroll: 'never',
            hexpand: true,
            vexpand: true,
            child: Box,
        })
    }

    const get_wallpapers = () =>
    {
        const activeId = hyprland.active.workspace.bind("id");

        var wallpapers: any[] = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))
        return wallpapers.map((wallpaper, key) =>
        {
            key += 1

            return Widget.Button({
                vpack: "center",
                css: `background-image: url('${wallpaper}');`,
                class_name: activeId.as((i) => `${i == key ? "workspace-wallpaper focused" : "workspace-wallpaper"}`),
                label: `${key}`,
                on_primary_click: (_, event) =>
                {
                    bottom.child.reveal_child = true
                    selectedWorkspace = key
                },
            })
        })
    }

    const reset = Widget.Button({
        vpack: "center",
        class_name: "reload-wallpapers",
        label: "󰑐",
        on_primary_click: () =>
        {
            Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"`).catch(err => print(err));
        }
    })

    const top = Widget.Box({
        hexpand: true,
        vexpand: true,
        hpack: "center",
        spacing: 10,
        children: [...get_wallpapers(), reset]
    });

    const random = Widget.Button({
        vpack: "center",
        class_name: "random-wallpaper",
        label: "",
        on_primary_click: () =>
        {
            Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace}"`)
                .then(() => bottom.child.reveal_child = false)
                .finally(() =>
                {
                    let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))[selectedWorkspace - 1]
                    top.children[selectedWorkspace - 1].css = `background-image: url('${new_wallpaper}');`
                })
                .catch(err => Utils.notify(err));
        }
    })

    const hide = Widget.Button({
        vpack: "center",
        class_name: "stop-selection",
        label: "",
        on_primary_click: () =>
        {
            bottom.child.reveal_child = false
        }
    })

    const bottom = Widget.Box({
        hexpand: true,
        vexpand: true,
        spacing: 10,
        child: Widget.Revealer({
            visible: true,
            reveal_child: false,
            transition: "slide_down",
            transition_duration: globalTransition,
            child: Widget.Box({
                children: [random, allWallpapers(), hide]
            }),
            // setup: (self) => timeout(1, () => self.reveal_child = false)
        })
    });

    return Widget.Box({
        class_name: "wallpaper-switcher",
        vertical: true,
        children: [top, bottom],
    })


}

export default () =>
{
    return Widget.Window({

        name: `wallpaper-switcher`,
        class_name: "",
        anchor: [],
        visible: false,
        child: Wallpapers(),
    })
}