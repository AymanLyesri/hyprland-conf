import cava from "service/cava"
import PanelButton from "../PanelButton"
import options from "options"

const mpris = await Service.import("mpris")

const {
    palette,
} = options.theme

const primary = palette.primary.bg
const secondary = palette.secondary.bg

// Pango’s text markup language
function formatIcons(input)
{
    let output = '';
    for (let char of input) {
        let icon;
        switch (char) {
            case '▁':
                icon = `<span foreground='${primary}'>▁</span>`;
                break;
            case '▂':
                icon = `<span foreground='${primary}'>▂</span>`;
                break;
            case '▃':
                icon = `<span foreground='${primary}'>▃</span>`;
                break;
            case '▄':
                icon = `<span foreground='${primary}'>▄</span>`;
                break;
            case '▅':
                icon = `<span foreground='${secondary}'>▅</span>`;
                break;
            case '▆':
                icon = `<span foreground='${secondary}'>▆</span>`;
                break;
            case '▇':
                icon = `<span foreground='${secondary}'>▇</span>`;
                break;
            case '█':
                icon = `<span foreground='${secondary}'>█</span>`;
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
    const btn = PanelButton({
        window: "cava",
        setup: self =>
        {
            if (pos != null)
                self.toggleClassName(pos)
        },
        child: Widget.Label({ use_markup: true })
            .hook(cava, self =>
            {
                const data = formatIcons(cava.output)
                self.label = data
            }, "output-changed")
    })

    const update = () =>
    {
        btn.visible = !!mpris.players[0];
    }

    return btn
        .hook(mpris, update, "notify::players")
}