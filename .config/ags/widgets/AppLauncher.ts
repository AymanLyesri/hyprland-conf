import Gdk from "gi://Gdk";
import { readJson, readJSONFile } from "utils/json"
import { emptyWorkspace, globalMargin, newAppWorkspace } from "variables";
import { closeProgress, openProgress } from "./Progress";
import { containsProtocolOrTLD, formatToURL, getDomainFromURL } from "utils/url";
import { arithmetic, containsOperator } from "utils/arithmetic";
import { getArgumentAfterSpace, getArgumentBeforeSpace } from "utils/string";
const Hyprland = await Service.import('hyprland')

interface Result
{
    app_name: string,
    app_exec: string,
    app_arg?: string,
    app_type?: string,
    app_icon?: string
}

const Results = Variable<Result[]>([])

function Entry()
{
    const help = Widget.Menu({
        children: [
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: '... ... \t\t =>> \t open with argument' }),
            }),
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: 'translate .. > .. \t =>> \t translate into (en,fr,es,de,pt,ru,ar...)' }),
            }),
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: 'https://... \t\t =>> \t open link' }),
            }),
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: '... .com \t\t =>> \t open link' }),
            }),
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: '..*/+-.. \t\t =>> \t arithmetics' }),
            }),
            Widget.MenuItem({
                child: Widget.Label({ xalign: 0, label: 'emoji ... \t\t =>> \t search emojis' }),
            }),
        ],
    })

    let debounceTimer: any

    return Widget.Box({
        spacing: 5,
        children: [
            Widget.Icon({
                class_name: "icon",
                icon: "preferences-system-search-symbolic"
            }),
            Widget.Entry({
                hexpand: true,
                placeholder_text: "Search for an app, emoji, translate, url, or do some math...",

                on_change: async ({ text }) =>
                {
                    // Clear any previously set timer
                    if (debounceTimer) {
                        clearTimeout(debounceTimer);
                    }

                    // Set a new timer with a delay (e.g., 300ms)
                    debounceTimer = setTimeout(async () =>
                    {
                        try {
                            if (text == "" || text == " " || text == null) {
                                Results.value = [];
                            } else if (text.includes("translate")) {
                                let language = text.includes(">") ? text.split(">")[1].trim() : "en";
                                Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/translate.sh '${text.split(">")[0].replace("translate", "").trim()}' '${language}'`));
                            } else if (text.includes("emoji")) {
                                Results.value = readJSONFile(`${App.configDir}/assets/emojis/emojis.json`).filter(emoji => emoji.app_tags.toLowerCase().includes(text.replace("emoji", "").trim()));
                            } else if (containsProtocolOrTLD(getArgumentBeforeSpace(text))) {
                                Results.value = [{ app_name: getDomainFromURL(text), app_exec: `xdg-open ${formatToURL(text)}`, app_type: 'url' }];
                            } else if (containsOperator(getArgumentBeforeSpace(text))) {
                                Results.value = [{ app_name: arithmetic(text), app_exec: `wl-copy ${arithmetic(text)}`, app_type: 'calc' }];
                            } else {
                                Results.value = readJson(await Utils.execAsync(`${App.configDir}/scripts/app-search.sh ${text}`));
                                if (Results.value.length == 0)
                                    Results.value = [{ app_name: `Try ${text}`, app_exec: text, app_icon: "󰋖" }];
                            }
                        } catch (err) {
                            print(err);
                        }
                    }, 10);  // 300ms delay
                },
                on_accept: () =>
                {
                    // Utils.notify({ summary: "Enter", body: String(ResultsDisplay.child.child.child.children[0].child) });
                    (ResultsDisplay as any).child.child.child.children[0].child.clicked()
                },
            }).on("key-press-event", (self, event: Gdk.Event) =>
            {
                if (event.get_keyval()[1] == 65307) // Escape key
                {
                    self.text = ""
                    App.closeWindow("app-launcher")
                }
            })
            , Widget.Button({
                label: "󰋖",
                on_primary_click: (_, event) =>
                {
                    help.popup_at_pointer(event)
                },
            })
        ]
    })
}

const organizeResults = (results: Result[]) =>
{
    const buttonContent = (element: Result) => Widget.Box({
        spacing: 10,
        hpack: element.app_type == 'emoji' ? "center" : "start",
        children: [
            element.app_type == 'app' ? Widget.Icon({ icon: element.app_icon || "view-grid-symbolic" }) : Widget.Label({ label: element.app_icon }),
            Widget.Label({ label: element.app_name }),
            Widget.Label({ class_name: "argument", label: element.app_arg || "" })
        ],
    })

    const button = (element: Result) => Widget.Button({
        hexpand: true,
        child: buttonContent(element),
        on_clicked: () =>
        {
            if (element.app_type == "app") {
                openProgress()
                Utils.execAsync(`${App.configDir}/scripts/app-loading-progress.sh ${element.app_name}`)
                    .then((workspace) => newAppWorkspace.value = Number(workspace))
                    .finally(() => closeProgress())
                    .catch(err => Utils.notify({ summary: "Error", body: err }));
            }

            Hyprland.messageAsync(`dispatch exec ${element.app_exec} ${element.app_arg || ""}`)
                .then(() =>
                {
                    switch (element.app_type) {
                        case 'app':
                            // Utils.notify({ summary: "App", body: `Opening ${element.app_name}` });
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

    if (results.length == 0) return Widget.Box()

    const rows = Widget.Box({
        class_name: "results",
        vertical: true,
        vexpand: true,
        hexpand: true,
    })
    const columns: number = results[0].app_type == "emoji" ? 4 : 2

    for (let i = 0; i < results.length; i += columns) {
        const rowResults = results.slice(i, i + columns)
        rows.pack_end(Widget.Box({
            vertical: false,
            spacing: 5,
            children: rowResults.map(element => button(element))
        }), false, false, 0)
    }

    const maxHeight = 500

    return Widget.Scrollable({
        // hscroll: 'never',
        vexpand: true,
        hexpand: true,
        css: `min-height: ${rows.children.length * 50 > maxHeight ? maxHeight : rows.children.length * 50}px`,
        child: rows
    })
}

const ResultsDisplay = Widget.Box({
    child: Results.bind().as(organizeResults)
})

export default () =>
{
    return Widget.Window({
        name: `app-launcher`,
        anchor: emptyWorkspace.as(empty => empty == 1 ? [] : ["top", "left"]),
        exclusivity: "normal",
        keymode: "on-demand",
        layer: "top",
        margins: [5, globalMargin, globalMargin, globalMargin], // top right bottom left
        visible: false,

        child: Widget.EventBox({
            child: Widget.Box({
                vertical: true,
                class_name: "app-launcher",
                children: [Entry(), ResultsDisplay],
            }),
        }),
    })
}
