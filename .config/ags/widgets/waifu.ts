import { Waifu } from "../interfaces/waifu.interface";
var image = App.configDir + "/assets/images/waifu.jpg"

function readJSONFile(filePath: string): any
{
    try {
        const data = Utils.readFile(filePath);
        return data.trim() ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error:', e);
        return null;
    }
}
var imageDetails = Variable<Waifu>(readJSONFile(`${App.configDir}/assets/images/waifu.json`))
var previousImageDetails = readJSONFile(`${App.configDir}/assets/images/previous.json`)


function Image()
{
    // GetImageFromApi()
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: () => Utils.execAsync(`firefox https://danbooru.donmai.us/posts/${imageDetails.value.id}`),
        child: Widget.Box({
            child: Actions(),
            css: imageDetails.bind().as(imageDetails =>
            {
                return `
                background-image: url("${image}");
                min-height: ${Number(imageDetails.image_height) / Number(imageDetails.image_width) * 300}px;
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
        Utils.execAsync(`notify-send "Waifu" "${output}"`)
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
                on_clicked: () => Utils.execAsync(`cat ${App.configDir}/assets/images/waifu.jpg | wl-copy --type image/jpeg`),
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