import Gdk from "gi://Gdk";
import app from "types/app";
import { readJson } from "utils/json"
import { appLauncherVisibility, bar_margin } from "variables";

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
                    Utils.execAsync(Results.value[0].app_exec).catch(err => print(err));
                    appLauncherVisibility.value = false
                    self.text = ""
                },
            }).on("key-press-event", (self, event: Gdk.Event) =>
            {
                if (event.get_keyval()[1] == 65307) // Escape key
                {
                    self.text = ""
                    appLauncherVisibility.value = false
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
        children: Results.bind().as(Results => Results.map(element =>
        {
            return Widget.Button({
                class_name: `button`,
                label: element.app_name,
                on_clicked: () =>
                {
                    Utils.execAsync(element.app_exec).catch(err => print(err));
                    appLauncherVisibility.value = false
                },
            })
        })
        ),
    })
}

export async function AppLauncher()
{
    return Widget.Window({
        name: `app-launcher`,
        anchor: bar_margin.as(margin => margin == 10 ? [] : ["top", "left"]),
        exclusivity: "normal",
        keymode: "on-demand",
        layer: "top",
        margins: [10, 10], // top right bottom left
        visible: appLauncherVisibility.bind(),

        child: Widget.EventBox({
            // on_hover_lost: () => mediaVisibility.value = false,
            child: Widget.Box({
                vertical: true,
                class_name: "app-launcher",
                children: [Input(), ResultsDisplay()]

            }),
        }),
    })
}
