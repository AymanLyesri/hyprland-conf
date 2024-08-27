import cava_service from "cava-service"
import { Button } from "types/widget"

const mpris = await Service.import("mpris")




// Pango’s text markup language
function formatIcons(input)
{
    let output = '';
    for (let char of input) {
        let icon;
        switch (char) {
            case '▁':
                icon = `<span>▁</span>`;
                break;
            case '▂':
                icon = `<span>▂</span>`;
                break;
            case '▃':
                icon = `<span>▃</span>`;
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

const Cava = () =>
{
    const btn = Button({
        child: Widget.Label({ use_markup: true })
            .hook(cava_service, self =>
            {
                const data = formatIcons(cava_service.output)
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

export default Cava;