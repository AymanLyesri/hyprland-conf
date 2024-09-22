import { readJSONFile } from "utils/json";
import { Waifu } from "../../../interfaces/waifu.interface";
import { rightPanelWidth, waifuPath, waifuVisibility } from "variables";
import { getDominantColor } from "utils/image";
import { closeProgress, openProgress } from "../../Progress";
import { getOption, setOption } from "utils/options";
const Hyprland = await Service.import('hyprland')

var imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/waifu/waifu.json`))
var previousImageDetails = readJSONFile(`${App.configDir}/assets/waifu/previous.json`)
var nsfw = Variable<boolean>(false)

function GetImageFromApi(param = "")
{
    openProgress()
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${nsfw.value} "${param}"`).then((output) =>
    {
        closeProgress()
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/waifu/waifu.json`))
        previousImageDetails = JSON.parse(Utils.readFile(`${App.configDir}/assets/waifu/previous.json`))
        print(imageDetails.value.id)
    }).catch(async (error) => await Utils.notify({ summary: "Error", body: error }))
}

const SearchImage = () => Utils.execAsync(`bash -c "xdg-open 'https://danbooru.donmai.us/posts/${imageDetails.value.id}' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`)
    .then((browser) => Utils.notify({ summary: 'Waifu', body: `opened in ${browser}` }))
    .catch(err => print(err))

const CopyImage = () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`)
    .then(() => Utils.notify({ summary: 'Clipboard', body: 'waifu copied to clipboard' }))
    .catch(err => print(err))

const OpenImage = () => Hyprland.sendMessage("dispatch exec [float;size 50%] feh --scale-down " + waifuPath)

function Actions()
{
    const terminalWaifuPath = `${App.configDir}/assets/terminal/icon.jpg`

    const top = Widget.Box({
        class_name: "top",
        vpack: "start",
        vexpand: true,
        children: [
            Widget.Button({
                label: "Pin",
                class_name: "pin",
                on_clicked: () =>
                {
                    Utils.execAsync(`bash -c "cmp -s ${waifuPath} ${terminalWaifuPath} && { rm ${terminalWaifuPath}; echo 1; } || { cp ${waifuPath} ${terminalWaifuPath}; echo 0; }"`)
                        .then((output) => Utils.notify({ summary: "Waifu", body: `${Number(output) == 0 ? 'Pinned To Terminal' : 'UN-Pinned from Terminal'}` }))
                        .catch(err => print(err))
                },
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

    const actions = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_up',
        child: Widget.Box({ vertical: true },
            Widget.Box([
                Widget.Button({
                    label: "Undo",
                    hexpand: true,
                    class_name: "undo",

                    on_clicked: () => GetImageFromApi(previousImageDetails.id),
                }),
                Widget.Button({
                    label: "Random",
                    hexpand: true,
                    class_name: "random",
                    on_clicked: async () => GetImageFromApi(),
                }),
                Widget.Button({
                    label: "Search",
                    hexpand: true,
                    class_name: "search",
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
                Widget.Button({
                    label: "Nsfw",
                    class_name: "nsfw",
                    hexpand: true,
                    on_clicked: () =>
                    {
                        nsfw.value = !nsfw.value
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
        children: [Widget.ToggleButton({
            label: "",
            class_name: "action-trigger",
            hpack: "end",
            onToggled: (self) =>
            {
                actions.reveal_child = self.active
                self.label = self.active ? "" : ""
                // while (true) && !actions.child.children[2].child
                setTimeout(() =>
                {
                    if (self.active) {
                        actions.reveal_child = false;
                        self.label = ""
                        self.active = false
                    }
                }, 15000)
            },
        }), actions],
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
    // GetImageFromApi()
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
    return Widget.EventBox({
        class_name: "waifu-event",
        visible: waifuVisibility.bind(),
        child: Widget.Box(
            {
                vertical: true,
                class_name: "waifu",
            },
            Image(),

        ),
    })
}

export function WaifuVisibility()
{
    return Widget.ToggleButton({
        onToggled: ({ active }) => { waifuVisibility.value = active },
        label: "",
        class_name: "waifu icon",
    }).hook(waifuVisibility, (self) => self.active = waifuVisibility.value, "changed")
}
