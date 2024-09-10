import { readJson } from "utils/json"

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
                visibility: true, // set to false for passwords
                onChange: async ({ text }) =>
                {
                    // Clear the previous timeout
                    clearTimeout(debounceTimeout);

                    // Set a new timeout for 500ms
                    debounceTimeout = setTimeout(async () =>
                    {
                        Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/app-search.sh ${text}`));
                    }, 250); // 250ms delay
                },
                onAccept: () => Utils.execAsync(Results.value[0].app_exec),
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
                on_clicked: () => Utils.execAsync(element.app_exec),
            })
        })
        ),
    })
}

export function AppLauncher()
{
    return Widget.Window({
        name: `app-launcher`,
        anchor: ["top", "left"],
        // exclusivity: "top",
        keymode: "on-demand",
        layer: "top",
        margins: [10, 10],
        visible: true,

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
