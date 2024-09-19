import { readJSONFile } from "utils/json";
import { Waifu } from "../../interfaces/waifu.interface";
import { waifuPath } from "variables";
import { getDominantColor } from "utils/image";
import { closeProgress, openProgress } from "../../widgets/Progress";

const image = waifuPath

var imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/images/waifu.json`))
var previousImageDetails = readJSONFile(`${App.configDir}/assets/images/previous.json`)
var nsfw = Variable<boolean>(false)

function GetImageFromApi(param = "")
{
    openProgress()
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${nsfw.value} "${param}"`).then((output) =>
    {
        closeProgress()
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/waifu.json`))
        previousImageDetails = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/previous.json`))
        print(imageDetails.value.id)
    }).catch(async (error) => await Utils.execAsync(`notify-send "Error" "${error}"`))
}

const SearchImage = () => Utils.execAsync(`bash -c "xdg-open 'https://danbooru.donmai.us/posts/${imageDetails.value.id}' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`).then((browser) => Utils.execAsync(`notify-send "Waifu" "opened in ${browser}"`)).catch(err => print(err))

const CopyImage = () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`).then(() => Utils.execAsync('notify-send "Waifu" "Copied"')).catch(err => print(err))

const OpenImage = () => Utils.execAsync(`hyprctl dispatch exec "[float;size 50%] feh --scale-down ${waifuPath}"`).catch(err => print(err))

function Image()
{
    // GetImageFromApi()
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: async () => OpenImage(),
        on_secondary_click: async () => CopyImage(),
        child: Widget.Box({
            hexpand: false,
            vexpand: false,
            child: Actions(),
            css: imageDetails.bind().as(imageDetails =>
            {
                return `
                background-image: url("${image}");
                min-height: ${Number(imageDetails.image_height) / Number(imageDetails.image_width) * 300}px;
                box-shadow: 0 0 5px 0 ${getDominantColor(image)};
                `
            }),
        }),
    })
}

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
                class_name: "button pin",
                on_clicked: () =>
                {
                    Utils.execAsync(`bash -c "cmp -s ${waifuPath} ${terminalWaifuPath} && { rm ${terminalWaifuPath}; echo 1; } || { cp ${waifuPath} ${terminalWaifuPath}; echo 0; }"`)
                        .then((output) => Utils.execAsync(`notify-send "Waifu" "${Number(output) == 0 ? 'Pinned To Terminal' : 'UN-Pinned from Terminal'}"`))
                        .catch(err => print(err))
                },
            }),
        ],
    })

    const Entry = Widget.EventBox({
        class_name: "input button entry",
        child: Widget.Entry({
            placeholder_text: 'Tags/ID',
            text: "",
            on_accept: (self) =>
            {
                if (self.text == null || self.text == "") {
                    return
                }
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
                    class_name: "button undo",

                    on_clicked: () => GetImageFromApi(previousImageDetails.id),
                }),
                Widget.Button({
                    label: "Random",
                    hexpand: true,
                    class_name: "button random",
                    on_clicked: async () => GetImageFromApi(),
                }),
                Widget.Button({
                    label: "Search",
                    hexpand: true,
                    class_name: "button search",
                    on_clicked: async () => SearchImage(),
                }),
                Widget.Button({
                    label: "Copy",
                    hexpand: true,
                    class_name: "button copy",
                    on_clicked: async () => CopyImage(),
                })
            ]),
            Widget.Box([
                Widget.Button({
                    label: "",
                    class_name: "button entry-search",
                    hexpand: true,
                    on_clicked: () => GetImageFromApi(Entry.child.text || ""),
                }),
                Entry,
                Widget.Button({
                    label: "Nsfw",
                    class_name: "button nsfw",
                    hexpand: true,
                    on_clicked: () =>
                    {
                        nsfw.value = !nsfw.value
                        Utils.execAsync(`notify-send "NSFW" "${nsfw.value ? "Enabled" : "Disabled"}"`).catch(err => print(err))
                    },
                }),
            ])
        )
    })
    const bottom = Widget.Box({
        class_name: "bottom",
        vertical: true,
        vpack: "end",
        children: [Widget.Button({
            label: "",
            class_name: "button action-trigger",
            hpack: "end",
            on_clicked: (self) =>
            {
                actions.reveal_child = !actions.reveal_child
                self.label = actions.reveal_child ? "" : ""
                // while (true) && !actions.child.children[2].child
                if (actions.reveal_child) {
                    setTimeout(() =>
                    {
                        actions.reveal_child = false;
                        self.label = ""
                    }, 15000)
                }
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

export default () =>
{
    return Widget.EventBox({
        class_name: "waifu-event",
        child: Widget.Box(
            {
                vertical: true,
                class_name: "waifu",
            },
            Image(),

        ),
    })
}