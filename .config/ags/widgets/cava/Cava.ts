
import { getDominantColor } from "utils/image";
import cavaService from "./cavaService";
import { globalTransition } from "variables";
// import options from "options"

const mpris = await Service.import("mpris")

// const {
//     palette,
// } = options.theme

const primary = "white"
const secondary = "gray"

// const color = getDominantColor(mpris.players.find(player => player.play_back_status === "Playing").cover_path)

// Pango’s text markup language
function formatIcons(input)
{

    let output = '';
    for (let char of input) {
        let icon;
        switch (char) {
            case '▁':
                icon = `<span color='grey'>▁</span>`;
                break;
            case '▂':
                icon = `<span color='grey'>▂</span>`;
                break;
            case '▃':
                icon = `<span color='grey'>▃</span>`;
                break;
            case '▄':
                icon = `<span>▄</span>`;
                break;
            case '▅':
                icon = `<span>▅</span>`;
                break;
            case '▆':
                icon = `<span>▆</span>`;
                break;
            case '▇':
                icon = `<span>▇</span>`;
                break;
            case '█':
                icon = `<span>█</span>`;
                break;
            default:
                icon = char;
                break;
        }
        output += icon;
    }
    return output;
}

export default (pos: string) =>
{
    const btn = Widget.Button({
        class_name: "cava",
        setup: self =>
        {
            if (pos != null)
                self.toggleClassName(pos)
        },
        child: Widget.Label({ use_markup: true })
            .hook(cavaService, self =>
            {
                const data = formatIcons(cavaService.output)
                self.label = data
            }, "output-changed")
    })

    const revealer = Widget.Revealer({
        transitionDuration: globalTransition,
        transition: 'slide_left',
        reveal_child: false,
        child: btn,
    })

    const update = () => setTimeout(() => revealer.reveal_child = !!mpris.players.find(player => player.play_back_status === "Playing"), 1000)

    return revealer
        .hook(mpris, update, "changed")
}