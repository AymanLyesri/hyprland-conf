import Gdk from "gi://Gdk";
import { readJson } from "utils/json"
import { emptyWorkspace, globalMargin } from "variables";
import { closeProgress, openProgress } from "./Progress";
import { Box } from "types/widget";
const Hyprland = await Service.import('hyprland')

var Results = Variable<{ app_name: string, app_exec: string, app_icon: string }[]>([]
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
                    clearTimeout(debounceTimeout);

                    // Set a new timeout for 500ms
                    debounceTimeout = setTimeout(async () =>
                    {
                        Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/app-search.sh ${text}`));
                    }, 100); // 100ms delay
                },
                on_accept: () =>
                {
                    ResultsDisplay.children[0].clicked()
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



const ResultsDisplay = Widget.Box({
    class_name: "results",
    vertical: true,
    hexpand: true,
    children: Results.bind().as(Results => Results.map((element, key) =>
    {
        const content = Widget.Box({
            spacing: 10,
            children: [
                Widget.Icon({ icon: element.app_icon ? element.app_icon : "dialog-application-symbolic" }),
                Widget.Label({ label: element.app_name })
            ]
        })

        return Widget.Button({
            hexpand: true,
            xalign: 0,
            child: content,
            on_clicked: () =>
            {
                openProgress()
                Utils.execAsync(`${App.configDir}/scripts/app-loading-progress.sh ${element.app_name}`)
                    .finally(() => closeProgress())
                    .catch(err => Utils.notify({ summary: "Error", body: err }));

                Hyprland.sendMessage(`dispatch exec ${element.app_exec}`)
                    .then(() => App.closeWindow("app-launcher"))
                    .catch(err => Utils.notify({ summary: "Error", body: err }));

            },
        })
    })
    ),
})


export default () =>
{
    return Widget.Window({
        name: `app-launcher`,
        anchor: emptyWorkspace.as(margin => margin == 1 ? [] : ["top", "left"]),
        exclusivity: "normal",
        keymode: "on-demand",
        layer: "top",
        margins: [5, globalMargin, globalMargin, globalMargin], // top right bottom left
        visible: false,

        child: Widget.EventBox({
            child: Widget.Box({
                vertical: true,
                class_name: "app-launcher",
                children: [Input(), ResultsDisplay]

            }),
        }),
    })
}
