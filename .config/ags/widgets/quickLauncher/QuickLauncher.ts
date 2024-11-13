import Gdk from "types/types/@girs/gdk-3.0/gdk-3.0";
import { globalSettings } from "utils/settings";
import { globalMargin, newAppWorkspace, quickLauncherVisibility } from "variables";
import { closeProgress, openProgress } from "widgets/Progress";
const Hyprland = await Service.import('hyprland')

const help = Widget.Menu({
    children: [
        Widget.MenuItem({
            child: Widget.Label({ label: 'Still WIP, improvements will come' }),
        }),
        Widget.MenuItem({
            child: Widget.Label({ label: 'Click to edit custom apps' }),
            on_activate: () =>
            {
                Utils.notify({ summary: "Opening", body: "$HOME/.config/ags/assets/settings/settings.json" });
                Hyprland.messageAsync("dispatch exec code $HOME/.config/ags/assets/settings/settings.json")
            },
        }),
    ],
})


const Apps = globalSettings.value.quickLauncher.apps


const Display = () =>
{
    const apps = Widget.Box({
        class_name: "quick-apps",
        spacing: 5,
        children: Apps.map(app =>
        {
            return Widget.Button({
                class_name: "quick-app",
                child: Widget.Box({
                    spacing: 5,
                    children: [
                        Widget.Label({
                            class_name: "icon",
                            label: app.icon,
                        }),
                        Widget.Label({
                            label: app.name,
                        }),
                    ],
                }),
                on_primary_click: () =>
                {
                    openProgress()
                    Utils.execAsync(`bash ${App.configDir}/scripts/app-loading-progress.sh ${app.app_name}`)
                        .then((workspace) => newAppWorkspace.value = Number(workspace))
                        .finally(() => closeProgress())
                        .catch(err => Utils.notify({ summary: "Error", body: err }));
                    Hyprland.messageAsync(`dispatch exec ${app.exec}`).then(() =>
                    {
                        // App.closeWindow("app-launcher")
                        Utils.notify({ summary: "App", body: `Opening ${app.app_name}` });
                    }).catch(err => Utils.notify({ summary: "Error", body: err }));
                },
            })
        }),
    })

    const info = Widget.Button({
        class_name: "info",
        label: "󰋖",
        on_primary_click: (_, event) =>
        {
            help.popup_at_pointer(event)
        },
    })

    return Widget.Box({
        class_name: "quick-launcher",
        spacing: 5,
        children: [
            apps,
            info,
        ],
    })

}


export default () =>
{
    return Widget.Window({
        name: `quick-launcher`,
        anchor: ["bottom"],
        exclusivity: "normal",
        keymode: "on-demand",
        layer: "top",
        margins: [globalMargin, globalMargin], // top right bottom left
        visible: quickLauncherVisibility.value,

        child: Widget.Box({
            css: "padding:10px",
            child: Widget.EventBox({
                child: Display(),
                on_hover_lost: () => quickLauncherVisibility.value = false,
                // setup: (self) => self.on('leave-notify-event', (self, event: Gdk.Event) =>
                // {
                //     const [_, x, y] = event.get_root_coords();
                //     if (y < 0) quickLauncherVisibility.value = false;
                // })
            }),
        })
    }).hook(quickLauncherVisibility, (self) => self.visible = quickLauncherVisibility.value, "changed");
}
