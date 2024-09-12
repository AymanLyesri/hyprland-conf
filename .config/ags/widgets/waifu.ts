import { readJSONFile } from "utils/json";
import { Waifu } from "../interfaces/waifu.interface";
import { waifuPath } from "variables";
import { getDominantColor } from "utils/image";

const image = waifuPath

var imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/images/waifu.json`))
var previousImageDetails = readJSONFile(`${App.configDir}/assets/images/previous.json`)


function Image()
{
    // GetImageFromApi()
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: async () => Utils.execAsync(`firefox https://danbooru.donmai.us/posts/${imageDetails.value.id}`).catch(err => print(err)),
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

// Fetch random posts from Danbooru API
function GetImageFromApi(id = "")
{
    Utils.execAsync(`python ${App.configDir}/scripts/get-waifu.py ${id}`).then((output) =>
    {
        Utils.execAsync(`notify-send "Waifu" "${output}"`).catch(err => print(err));
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/waifu.json`))
        previousImageDetails = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/previous.json`))
        print(imageDetails.value.id)
    }).catch((error) => print(error))
}

function Actions()
{
    return Widget.Box({
        class_name: "actions",
        hexpand: true,
        vexpand: false,
        // hpack: "center",
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
            Widget.Button({
                label: "Copy",
                hexpand: true,
                class_name: "button",
                on_clicked: async () => Utils.execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`).catch(err => print(err)),
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