import MediaWidget from "./MediaWidget";

const Hyprland = await Service.import("hyprland");

const pfpPath = Utils.exec(`bash -c "echo $HOME/.face"`)
const pfp = Variable<string>(pfpPath)
const username = Utils.exec(`whoami`)

const UserPanel = () =>
{

    const Profile = () =>
    {

        const UserName = Widget.Box({
            hpack: "center",
            class_name: "user-name",
            children: [
                Widget.Label({
                    label: "I'm "
                }),
                Widget.Label({
                    class_name: "name",
                    label: username
                })
            ]
        })

        const ProfilePicture = Widget.Box({
            class_name: "profile-picture",
            css: `background-image: url('${pfpPath}');`,
            child: Widget.FileChooserButton({
                hexpand: true,
                vexpand: true,
                title: "Select a profile picture",
                usePreviewLabel: false,
                onFileSet: ({ uri }) =>
                {
                    if (!uri) return;
                    const cleanUri = uri.replace('file://', ''); // Remove 'file://' from the URI
                    Utils.execAsync(`bash -c "cp '${cleanUri}' $HOME/.face"`)
                        .then(() => ProfilePicture.css = `background-image: url('${pfpPath}');`)
                        .finally(() => { Utils.notify(`Profile picture set to ${cleanUri}`) })
                        .catch(err => Utils.notify(err));
                },
            })
        })

        return Widget.Box({
            class_name: "profile",
            vertical: true,
            children: [
                ProfilePicture,
                UserName
            ]
        })
    }



    const Actions = () =>
    {
        const Logout = () => Widget.Button({
            hexpand: true,
            class_name: "logout",
            label: "󰍃",
            on_primary_click: () =>
            {
                Hyprland.messageAsync("dispatch exit")
            }
        })

        const Shutdown = () => Widget.Button({
            hexpand: true,
            class_name: "shutdown",
            label: "",
            on_primary_click: () =>
            {
                Utils.execAsync(`shutdown now`)
            }
        })

        const Restart = () => Widget.Button({
            hexpand: true,
            class_name: "restart",
            label: "󰜉",
            on_primary_click: () =>
            {
                Utils.execAsync(`reboot`)
            }
        })

        const Sleep = () => Widget.Button({
            hexpand: true,
            class_name: "sleep",
            label: "󰤄",
            on_primary_click: () =>
            {
                Utils.execAsync(`bash -c "$HOME/.config/hypr/scripts/hyprlock.sh suspend "`)
            }
        })

        return Widget.Box({
            class_name: "actions",
            vertical: true,
            spacing: 10,
            children: [
                Widget.Box({
                    class_name: "action",
                    spacing: 10,
                    children: [
                        Shutdown(),
                        Restart()
                    ]
                }),
                Widget.Box({
                    class_name: "action",
                    spacing: 10,
                    children: [
                        Sleep(),
                        Logout()
                    ]
                }),
            ]
        })
    }

    const middle = Widget.Box({
        hpack: "center",
        class_name: "bottom",
        vertical: true,
        spacing: 10,
        children: [
            Profile(),
            Actions()
        ]
    })

    return Widget.Box({
        class_name: "user-panel",
        spacing: 10,
        children: [
            MediaWidget(),
            middle,
        ]
    })
}

const WindowActions = () =>
{
    return Widget.Box({
        class_name: "window-actions",
        hexpand: true,
        hpack: "end",
        children: [
            Widget.Button({
                class_name: "close",
                label: "",
                on_primary_click: () =>
                {
                    App.closeWindow('user-panel')
                }
            })
        ]
    })
}

const Display = () =>
{
    return Widget.Box({
        class_name: "display",
        vertical: true,
        spacing: 10,
        children: [
            WindowActions(),
            UserPanel()
        ]
    })
}



export default () =>
{
    return Widget.Window({

        name: `user-panel`,
        class_name: "user-panel",
        anchor: [],
        visible: false,
        child: Display(),
    })
}