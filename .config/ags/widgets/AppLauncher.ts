import Gdk from "gi://Gdk";
import { readJson } from "utils/json"
import { emptyWorkspace, globalMargin } from "variables";
import { closeProgress, openProgress } from "./Progress";
const Hyprland = await Service.import('hyprland')

var Results = Variable<{ app_name: string, app_exec: string }[]>([]
    // readJson(Utils.exec(`${App.configDir}/scripts/app-search.sh`))
)

function Input()
{
    let debounceTimeout;
    return Widget.Box({
        // hpack: "start",
        children: [
            Widget.Icon({
                class_name: "icon",
                icon: "preferences-system-search-symbolic"
            }),
            Widget.Entry({
                class_name: "input",
                hexpand: true,
                onChange: async ({ text }) =>
                {
                    if (text == "") {
                        Results.value = []
                    }
                    // Clear the previous timeout
                    clearTimeout(debounceTimeout);

                    // Set a new timeout for 500ms
                    debounceTimeout = setTimeout(async () =>
                    {
                        Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/app-search.sh ${text}`));
                    }, 100); // 100ms delay
                },
                on_accept: (self) =>
                {
                    openProgress()
                    Utils.execAsync(`${App.configDir}/scripts/app-loading-progress.sh ${Results.value[0].app_name}`).finally(() => closeProgress())
                        .catch(err => Utils.notify({ summary: "Error", body: err }));
                    Utils.execAsync(Results.value[0].app_exec).catch(err => print(err));
                    self.text = ""
                    App.closeWindow("app-launcher")
                },
            }).on("key-press-event", (self, event: Gdk.Event) =>
            {
                if (event.get_keyval()[1] == 65307) // Escape key
                {
                    self.text = ""
                    // appLauncherVisibility.value = false
                    App.closeWindow("app-launcher")
                }

            })


        ]
    })
}

function ResultsDisplay()
{
    return Widget.Box({
        class_name: "results",
        vertical: true,
        hexpand: true,
        children: Results.bind().as(Results => Results.map((element, key) =>
        {
            return Widget.Button({
                hexpand: true,
                label: element.app_name,
                on_clicked: () =>
                {
                    // Utils.execAsync(element.app_exec).catch(err => print(err));
                    Hyprland.sendMessage(`dispatch exec ${element.app_exec}`).catch(err => print(err));
                    App.closeWindow("app-launcher")
                },
            })
        })
        ),
    })
}

export default () =>
{
    return Widget.Window({
        name: `app-launcher`,
        anchor: emptyWorkspace.as(margin => margin == 1 ? [] : ["top", "left"]),
        exclusivity: "normal",
        keymode: "on-demand",
        layer: "top",
        margins: [globalMargin, globalMargin], // top right bottom left
        visible: false,

        child: Widget.EventBox({
            child: Widget.Box({
                vertical: true,
                class_name: "app-launcher",
                children: [Input(), ResultsDisplay()]

            }),
        }),
    })
}
