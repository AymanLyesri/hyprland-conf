import Gdk from "gi://Gdk";
import { readJson } from "utils/json"
import { emptyWorkspace, globalMargin, newAppWorkspace } from "variables";
import { closeProgress, openProgress } from "./Progress";
import { containsProtocolOrTLD, formatToURL, getDomainFromURL } from "utils/url";
import { arithmetic, containsOperator } from "utils/arithmetic";
const Hyprland = await Service.import('hyprland')

const Results = Variable<any[]>([])

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
                        if (!text) return Results.value = []

                        if (containsProtocolOrTLD(text))
                            Results.value = [{ app_name: getDomainFromURL(text), app_exec: `xdg-open ${formatToURL(text)}`, type: 'url' }]
                        else if (containsOperator(text))
                            Results.value = arithmetic(text) ? [{ app_name: arithmetic(text), app_exec: `wl-copy ${arithmetic(text)}`, type: 'calc' }] : []
                        else
                            Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/app-search.sh ${text}`));

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
                if (element.type == "app") {
                    openProgress()
                    Utils.execAsync(`${App.configDir}/scripts/app-loading-progress.sh ${element.app_name}`)
                        .then((workspace) => newAppWorkspace.value = Number(workspace))
                        .finally(() => closeProgress())
                        .catch(err => Utils.notify({ summary: "Error", body: err }));
                }

                Hyprland.sendMessage(`dispatch exec ${element.app_exec}`)
                    .then(() =>
                    {
                        switch (element.type) {
                            case 'app':
                                Utils.notify({ summary: "App", body: `Opening ${element.app_name}` });
                                break;
                            case 'url':
                                let browser = Utils.exec(`bash -c "xdg-settings get default-web-browser | sed 's/\.desktop$//'"`);
                                Utils.notify({ summary: "URL", body: `Opening ${element.app_name} in ${browser}` });
                                break;
                            default:
                                break;
                        }
                    })
                    .finally(() => App.closeWindow("app-launcher"))
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
