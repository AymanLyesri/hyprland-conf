import Gdk from "gi://Gdk";
import { readJson } from "utils/json"
import { emptyWorkspace, globalMargin, newAppWorkspace } from "variables";
import { closeProgress, openProgress } from "./Progress";
const Hyprland = await Service.import('hyprland')

const Results = Variable<any[]>([])


function containsOperator(str: string): boolean
{
    // Regular expression to match common operators
    const operatorPattern = /[+\-*/]/;

    // Test if the string contains any of the operators
    return operatorPattern.test(str);
}

function Input()
{
    let debounceTimeout;
    return Widget.Box({
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
                        let script = ''

                        if (containsOperator(text || ''))
                            script = `${App.configDir}/scripts/arithmetic.sh ${text}`
                        else
                            script = `${App.configDir}/scripts/app-search.sh ${text}`

                        Results.value = readJson(await Utils.execAsync(script));
                    }, 100); // 100ms delay
                },
                on_accept: () =>
                {
                    ResultsDisplay.children[0]?.clicked()
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
                Widget.Icon({ icon: element.app_icon || "view-grid-symbolic" }),
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
                    .then((workspace) => newAppWorkspace.value = Number(workspace))
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
