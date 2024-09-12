import { readJSONFile } from "utils/json";
import { Waifu } from "../interfaces/waifu.interface";
import { waifuPath } from "variables";
import { getDominantColor } from "utils/image";
import { closeProgress, openProgress } from "./progress";

const image = waifuPath

var imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/images/waifu.json`))
var previousImageDetails = readJSONFile(`${App.configDir}/assets/images/previous.json`)

// Fetch random posts from Danbooru API
function GetImageFromApi(id = "")
{
    openProgress()
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${id}`).then((output) =>
    {
        closeProgress()
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/waifu.json`))
        previousImageDetails = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/previous.json`))
        print(imageDetails.value.id)
    }).catch(async (error) => await Utils.execAsync(`notify-send "Error" "${error}"`))
}


function Image()
{
    // GetImageFromApi()
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: async () => Utils.execAsync(`firefox https://danbooru.donmai.us/posts/${imageDetails.value.id}`).catch(err => print(err)),
        on_secondary_click: async () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`).catch(err => print(err)),
        child: Widget.Box({
            child: Actions(),
            css: imageDetails.bind().as(imageDetails =>
            {
                return `
                background-image: url("${image}");
                min-height: ${Number(imageDetails.image_height) / Number(imageDetails.image_width) * 300}px;
                box-shadow: 0 0 10px 0 ${getDominantColor(image)};
                `
            }),
        }),
    })
}


function Actions()
{
    return Widget.Box({
        class_name: "actions",
        // hexpand: true,
        // vexpand: false,
        vpack: "end",
        children: [
            Widget.Button({
                label: "Undo",
                hexpand: true,
                class_name: "button",

                on_clicked: () => GetImageFromApi(previousImageDetails.id),
            }),
            Widget.Button({
                label: "Random",
                hexpand: true,
                class_name: "button",
                on_clicked: async () => GetImageFromApi(),
            }),
            // Widget.Button({
            //     label: "Copy",
            //     hexpand: true,
            //     class_name: "button",
            //     on_clicked: async () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`).catch(err => print(err)),
            // }),
            Widget.EventBox({
                class_name: "input button",
                child: Widget.Entry({
                    placeholder_text: 'Danbooru id',
                    text: "",
                    on_accept: (self) =>
                    {
                        if (self.text == null || self.text == "") {
                            return
                        }
                        GetImageFromApi(self.text)
                        self.text = ""
                    },
                }),
            }),
        ],
    })
}

export function Waifu()
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