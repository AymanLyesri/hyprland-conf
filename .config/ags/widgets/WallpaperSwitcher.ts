

import { globalTransition } from "variables";

const hyprland = await Service.import("hyprland");

const allWallpapers = Variable<string[]>(JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --all')))

const selectedWorkspace = Variable<number>(0)

const sddm = Variable<boolean>(false)

function Wallpapers()
{
    const getAllWallpapers = () =>
    {
        const Box = Widget.Box({
            class_name: "all-wallpapers",
            spacing: 5,
            children: allWallpapers.bind().as((wallpapers) => wallpapers.map((wallpaper, key) =>
            {
                return Widget.Button({
                    class_name: "wallpaper",
                    css: `background-image: url('${wallpaper}');`,
                    on_primary_click: () =>
                    {
                        if (sddm.value) {
                            Utils.execAsync(`pkexec sh -c 'sed -i "s|^background=.*|background=\"${wallpaper}\"|" /usr/share/sddm/themes/where_is_my_sddm_theme/theme.conf'`)
                                .then(() => sddm.value = false)
                                .finally(() => Utils.notify({
                                    summary: "SDDMs",
                                    body: "SDDM wallpaper changed successfully!"
                                }))
                                .catch(err => Utils.notify(err));
                            App.closeWindow("wallpaper-switcher")
                        }
                        else {
                            Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.value} ${wallpaper}"`)
                                .finally(() =>
                                {
                                    let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))[selectedWorkspace.value - 1]
                                    top.children[selectedWorkspace.value - 1].css = `background-image: url('${new_wallpaper}');`
                                })
                                .catch(err => Utils.notify(err));
                        }
                    }
                })
            }))
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

    const getWallpapers = () =>
    {
        const activeId = hyprland.active.workspace.bind("id");

        var wallpapers: any[] = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))
        return wallpapers.map((wallpaper, key) =>
        {
            key += 1

            return Widget.Button({
                vpack: "center",
                css: `background-image: url('${wallpaper}');`,
                class_name: activeId.as((i) =>
                {
                    selectedWorkspace.value = i
                    return `${i == key ? "workspace-wallpaper focused" : "workspace-wallpaper"}`

                }),
                label: `${key}`,
                on_primary_click: (_, event) =>
                {
                    sddm.value = false
                    bottom.child.reveal_child = true
                    selectedWorkspace.value = key
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
            Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"`)
                .finally(() => allWallpapers.value = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --all')))
                .catch(err => print(err));
        }
    })

    const top = Widget.Box({
        hexpand: true,
        vexpand: true,
        hpack: "center",
        spacing: 10,
        children: [...getWallpapers(), reset]
    });

    const random = Widget.Button({
        vpack: "center",
        class_name: "random-wallpaper",
        label: "",
        on_primary_click: () =>
        {
            const randomWallpaper = allWallpapers.value[Math.floor(Math.random() * allWallpapers.value.length)];

            Utils.execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.value} ${randomWallpaper}"`)
                .finally(() =>
                {
                    let new_wallpaper = JSON.parse(Utils.exec(App.configDir + '/scripts/get-wallpapers.sh --current'))[selectedWorkspace.value - 1]
                    top.children[selectedWorkspace.value - 1].css = `background-image: url('${new_wallpaper}');`
                })
                .catch(err => Utils.notify(err));
        }
    })

    const custom = Widget.ToggleButton({
        vpack: "center",
        class_name: "custom-wallpaper",
        label: "all",
        on_toggled: (self) =>
        {
            allWallpapers.value = JSON.parse(Utils.exec(App.configDir + `/scripts/get-wallpapers.sh ${self.active ? "--custom" : "--all"}`))
            self.label = self.active ? "custom" : "all"
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

    const sddmToggle = Widget.ToggleButton({
        vpack: "center",
        class_name: "sddm",
        label: "sddm",
        on_toggled: ({ active }) =>
        {
            sddm.value = active
        }
    }).hook(sddm, (self) => self.active = sddm.value, "changed")

    const selectedWorkspaceLabel = Widget.Label({
        class_name: "button",
        label: Utils.merge([selectedWorkspace.bind(), sddm.bind()], (workspace, sddm) => `Wallpaper -> ${sddm ? "sddm" : `Workspace ${workspace}`}`)
    })

    const actions = Widget.Box({
        class_name: "actions",
        hexpand: true,
        hpack: "center",
        children: [sddmToggle, selectedWorkspaceLabel, random, custom, hide]
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
                vertical: true,
                children: [actions, getAllWallpapers()]
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