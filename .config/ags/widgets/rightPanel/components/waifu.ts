import { readJSONFile } from "utils/json";
import { Waifu } from "../../../interfaces/waifu.interface";
import { globalTransition, rightPanelWidth, waifuPath, waifuVisibility } from "variables";
import { getDominantColor } from "utils/image";
import { closeProgress, openProgress } from "../../Progress";
import { getOption, setOption } from "utils/options";
import { timeout } from "resource:///com/github/Aylur/ags/utils/timeout.js";
const Hyprland = await Service.import('hyprland')

const imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/waifu/waifu.json`))
const favoriteImageDetails = () => readJSONFile(`${App.configDir}/assets/waifu/favorite.json`)
const nsfw = Variable<boolean>(false)
const terminalWaifuPath = `${App.configDir}/assets/terminal/icon.jpg`

function GetImageFromApi(param = "")
{
    openProgress()
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${nsfw.value} "${param}"`).finally(() =>
    {
        closeProgress()
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/waifu/waifu.json`))
    }).catch((error) => Utils.notify({ summary: "Error", body: error }))
}

const SearchImage = () => Utils.execAsync(`bash -c "xdg-open 'https://danbooru.donmai.us/posts/${imageDetails.value.id}' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`)
    .then((browser) => Utils.notify({ summary: 'Waifu', body: `opened in ${browser}` }))
    .catch(err => Utils.notify({ summary: 'Error', body: err }))

const CopyImage = () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`)
    .then(() => Utils.notify({ summary: 'Clipboard', body: 'waifu copied to clipboard' }))
    .catch(err => Utils.notify({ summary: 'Error', body: err }))

const OpenImage = () => Hyprland.messageAsync("dispatch exec [float;size 50%] feh --scale-down " + waifuPath)

const FavoriteImage = () => Utils.execAsync(`bash -c "cp ${App.configDir}/assets/waifu/waifu.json ${App.configDir}/assets/waifu/favorite.json"`)
    .then(() => Utils.notify({ summary: 'Waifu', body: 'Added to favorite' }))
    .catch(err => Utils.notify({ summary: 'Error', body: err }))

const FavoriteToImage = async () => GetImageFromApi(favoriteImageDetails().id)

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
        vexpand: true,
        children: [
            Widget.Button({
                label: "Pin",
                class_name: "pin",
                on_clicked: () => PinImageToTerminal()
            }),
        ],
    })

    const Entry = Widget.EventBox({
        class_name: "input",
        child: Widget.Entry({
            placeholder_text: 'Tags/ID',
            text: getOption("waifu.input_history"),
            on_accept: (self) =>
            {
                if (self.text == null || self.text == "") {
                    return
                }
                setOption("waifu.input_history", self.text)
                GetImageFromApi(self.text)
            },
        }),
    })

    const favoriteMenu = Widget.Menu({
        children: [
            Widget.MenuItem({
                child: Widget.Label({
                    label: "Favorite this",
                }),
                on_activate: () => FavoriteImage()


            }),
            Widget.MenuItem({
                child: Widget.Label({
                    label: "Get Favorite",
                }),
                on_activate: () => FavoriteToImage().then(() => Utils.notify({ summary: 'Waifu', body: 'Favorite Enabled' }))
                    .catch(err =>
                    {
                        Utils.notify({ summary: "Error", body: err });
                        Utils.notify({ summary: "Waifu", body: "No favorite is found, Please right click to create one" })
                    }),

            }),
        ]
    })

    const actions = Widget.Revealer({
        revealChild: false,
        transitionDuration: globalTransition,
        transition: 'slide_up',
        child: Widget.Box({ vertical: true },
            Widget.Box([
                Widget.Button({
                    label: "",
                    class_name: "favorite",
                    hexpand: true,
                    on_primary_click: (_, event) => favoriteMenu.popup_at_pointer(event),
                }),
                Widget.Button({
                    label: "Random",
                    hexpand: true,
                    class_name: "random",
                    on_clicked: async () => GetImageFromApi(),
                }),
                Widget.Button({
                    label: "browser",
                    hexpand: true,
                    class_name: "browser",
                    on_clicked: async () => SearchImage(),
                }),
                Widget.Button({
                    label: "Copy",
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
                    on_clicked: () => Entry.child.activate(),
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
                        })
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
            bottom,
        ],

    })
}

function Image()
{
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: async () => OpenImage(),
        on_secondary_click: async () => SearchImage(),
        child: Widget.Box({
            hexpand: false,
            vexpand: false,
            child: Actions(),
            css: Utils.merge([imageDetails.bind(), rightPanelWidth.bind()], (imageDetails, width) =>
            {
                return `
                background-image: url("${waifuPath}");
                min-height: ${Number(imageDetails.image_height) / Number(imageDetails.image_width) * width}px;
                box-shadow: 0 0 5px 0 ${getDominantColor(waifuPath)};
                `
            }),
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
