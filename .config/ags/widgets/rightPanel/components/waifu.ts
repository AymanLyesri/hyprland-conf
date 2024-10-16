import { readJSONFile } from "utils/json";
import { Waifu } from "../../../interfaces/waifu.interface";
import { globalTransition, rightPanelWidth, waifuCurrent, waifuFavorites, waifuVisibility } from "variables";
import { closeProgress, openProgress } from "../../Progress";
import { getSetting, setSetting } from "utils/settings";
import { timeout } from "resource:///com/github/Aylur/ags/utils/timeout.js";
const Hyprland = await Service.import('hyprland')

const waifuPath = App.configDir + "/assets/waifu/waifu.png"
const jsonPath = App.configDir + "/assets/waifu/waifu.json"


const imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/waifu/waifu.json`))
const nsfw = Variable<boolean>(false)
const terminalWaifuPath = `${App.configDir}/assets/terminal/icon.jpg`

const GetImageFromApi = (param = "") =>
{
    openProgress()
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${nsfw.value} "${param}"`).finally(() =>
    {
        closeProgress()
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/waifu/waifu.json`))
        waifuCurrent.value = String(imageDetails.value.id)
    }).catch((error) => Utils.notify({ summary: "Error", body: error }))
}

const SearchImage = () => Utils.execAsync(`bash -c "xdg-open 'https://danbooru.donmai.us/posts/${imageDetails.value.id}' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`)
    .then((browser) => Utils.notify({ summary: 'Waifu', body: `opened in ${browser}` }))
    .catch(err => Utils.notify({ summary: 'Error', body: err }))

const CopyImage = () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`)
    .catch(err => Utils.notify({ summary: 'Error', body: err }))

const OpenImage = () => Hyprland.messageAsync("dispatch exec [float;size 50%] feh --scale-down " + waifuPath)

const addToFavorites = () =>
{
    if (!waifuFavorites.value.some(favorite => favorite === waifuCurrent.value)) {
        waifuFavorites.value = [...waifuFavorites.value, waifuCurrent.value];
        Utils.notify({ summary: 'Waifu', body: `${waifuCurrent.value} Favorite added` })
    }
    else {
        Utils.notify({ summary: 'Waifu', body: `${waifuCurrent.value} Already favored` })
    }

}

const PinImageToTerminal = () =>
{
    if (Utils.readFile(terminalWaifuPath) == '') Utils.exec(`mkdir -p ${terminalWaifuPath.split('/').slice(0, -1).join('/')}`);
    Utils.execAsync(`bash -c "cmp -s ${waifuPath} ${terminalWaifuPath} && { rm ${terminalWaifuPath}; echo 1; } || { cp ${waifuPath} ${terminalWaifuPath}; echo 0; }"`)
        .then((output) => Utils.notify({ summary: "Waifu", body: `${Number(output) == 0 ? 'Pinned To Terminal' : 'UN-Pinned from Terminal'}` }))
        .catch(err => print(err))
}

function Actions()
{
    const top = Widget.Box({
        class_name: "top",
        vpack: "start",
        hpack: "start",
        children: [
            Widget.Button({
                label: "Pin",
                class_name: "pin",
                on_clicked: () => PinImageToTerminal()
            }),
        ],
    })

    const Entry = Widget.Entry({
        class_name: "input",
        placeholder_text: 'Tags/ID',
        text: getSetting("waifu.input_history"),
        on_accept: (self) =>
        {
            if (self.text == null || self.text == "") {
                return
            }
            setSetting("waifu.input_history", self.text)
            GetImageFromApi(self.text)
        },
    })

    const actions = Widget.Revealer({
        revealChild: false,
        transitionDuration: globalTransition,
        transition: 'slide_up',
        child: Widget.Box({ vertical: true },
            Widget.Box([
                Widget.Button({
                    label: "",
                    class_name: "open",
                    hexpand: true,
                    on_primary_click: async () => OpenImage(),
                }),
                Widget.Button({
                    label: "",
                    class_name: "favorite",
                    hexpand: true,
                    on_primary_click: () => left.reveal_child = !left.reveal_child,
                }),
                Widget.Button({
                    label: "",
                    hexpand: true,
                    class_name: "random",
                    on_clicked: async () => GetImageFromApi(),
                }),
                Widget.Button({
                    label: "",
                    hexpand: true,
                    class_name: "browser",
                    on_clicked: async () => SearchImage(),
                }),
                Widget.Button({
                    label: "",
                    hexpand: true,
                    class_name: "copy",
                    on_clicked: async () => CopyImage(),
                })
            ]),
            Widget.Box([
                Widget.Button({
                    label: "",
                    class_name: "entry-search",
                    hexpand: true,
                    on_clicked: () => Entry.activate(),
                }),
                Entry,
                Widget.ToggleButton({
                    label: "",
                    class_name: "nsfw",
                    hexpand: true,
                    on_toggled: ({ active }) =>
                    {
                        nsfw.value = active
                        Utils.notify({ summary: "Waifu", body: `NSFW is ${nsfw.value ? 'Enabled' : 'Disabled'}` })
                            .catch(err => print(err))
                    },
                }),

            ])
        )
    })
    const left = Widget.Revealer({
        vexpand: true,
        hexpand: true,
        hpack: "start",
        transition: "slide_right",
        transition_duration: globalTransition,
        reveal_child: false,
        child: Widget.Scrollable({
            hscroll: 'never',
            css: "min-width: 100px",
            child: Widget.Box({
                class_name: "favorites",
                vertical: true,
                children: waifuFavorites.bind().as((favorites) =>
                {
                    return [...favorites.map((favorite) =>
                        Widget.EventBox({
                            class_name: "favorite-event",
                            child: Widget.Box({
                                class_name: "favorite",
                                spacing: 10,
                                children: [Widget.Label({
                                    label: String(favorite),
                                }), Widget.Button({
                                    hexpand: true,
                                    hpack: "end",
                                    class_name: "delete",
                                    label: "",
                                    on_primary_click: () => waifuFavorites.value = waifuFavorites.value.filter(fav => fav !== favorite)
                                })],
                            }),
                            on_primary_click: () =>
                            {
                                GetImageFromApi(String(favorite))
                                left.reveal_child = false
                            },
                        })
                    ), Widget.Button({
                        label: "",
                        class_name: "add",
                        on_primary_click: () => addToFavorites()
                    })]
                })
            })
        })
    })

    const bottom = Widget.Box({
        class_name: "bottom",
        vertical: true,
        vpack: "end",
        children: [
            Widget.ToggleButton({
                label: "",
                class_name: "action-trigger",
                hpack: "end",
                on_toggled: (self) =>
                {
                    actions.reveal_child = self.active
                    self.label = self.active ? "" : ""
                    if (self.active)
                        timeout(15000, () =>
                        {
                            actions.reveal_child = false;
                            self.label = ""
                            self.active = false

                            left.reveal_child = false
                        })
                    else left.reveal_child = false
                },
            }),
            actions
        ],
    })

    return Widget.Box({
        class_name: "actions",
        hexpand: true,
        vertical: true,
        children: [
            top,
            left,
            bottom,
        ],

    })
}

function Image()
{
    return Widget.EventBox({
        on_secondary_click: async () => SearchImage(),
        child: Widget.Box({
            class_name: "image",
            hexpand: false,
            vexpand: false,
            child: Actions(),
            css: Utils.merge([imageDetails.bind(), rightPanelWidth.bind()], (imageDetails, width) =>
            {
                return `
                background-image: url("${waifuPath}");
                min-height: ${Number(imageDetails.image_height) / Number(imageDetails.image_width) * width}px;
                `
            }),
            setup: () => { if (Utils.readFile(waifuPath) == '' || Utils.readFile(jsonPath) == '') GetImageFromApi(waifuCurrent.value) },
        }),
    })
}


export default () =>
{
    return Widget.Revealer({
        transitionDuration: globalTransition,
        transition: 'slide_down',
        reveal_child: waifuVisibility.bind(),
        child: Widget.EventBox({
            class_name: "waifu-event",
            child: Widget.Box(
                {
                    vertical: true,
                    class_name: "waifu",
                },
                Image(),
            ),
        })
    })
}

export function WaifuVisibility()
{
    return Widget.ToggleButton({
        onToggled: ({ active }) => { waifuVisibility.value = active },
        label: "󱙣",
        class_name: "waifu icon",
    }).hook(waifuVisibility, (self) => self.active = waifuVisibility.value, "changed")
}
