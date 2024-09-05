import { Waifu } from "../interfaces/waifu.interface";

var image = App.configDir + "/assets/images/waifu.jpg"
var imageDetails = Variable<Waifu>(JSON.parse(Utils.readFile(`${App.configDir}/assets/images/waifu.json`)))


function Image()
{
    // RandomImage()
    return Widget.EventBox({
        class_name: "image",
        on_primary_click: () => Utils.execAsync(`firefox https://danbooru.donmai.us/posts/${imageDetails.value.id}`),
        child: Widget.Box({
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
function RandomImage()
{
    Utils.execAsync(`${App.configDir}/scripts/get-waifu.sh`).then((output) =>
    {
        // image.value = ''
        // image.value = App.configDir + "/assets/images/waifu.jpg"
        imageDetails.value = JSON.parse(Utils.readFile(`${App.configDir}/assets/images/waifu.json`))
        print(imageDetails.value.id)
    }).catch((error) => print(error))
}

function Actions()
{
    return Widget.Box({
        class_name: "actions",
        hexpand: true,
        children: [
            Widget.Button({
                label: "Undo",
                hexpand: true,
                class_name: "button",

                on_clicked: () => Utils.execAsync(`wl-copy "I'm here to keep you company!"`),
            }),
            Widget.Button({
                label: "Random",
                hexpand: true,
                class_name: "button",
                on_clicked: async () => RandomImage(),
            }),
            Widget.Button({
                label: "Copy",
                hexpand: true,
                class_name: "button",
                on_clicked: () => Utils.execAsync(`wl-copy "I'm here to keep you company!"`),
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
            Actions(),
        ),

    })
}