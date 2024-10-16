
import { globalMargin } from "variables"
import { Player } from "./Player"

const mpris = await Service.import("mpris")
const players = mpris.bind("players")


export default () =>
{
    return Widget.Window({
        name: `media`,
        anchor: ["top"],
        margins: [5, globalMargin, globalMargin, globalMargin],
        visible: false,
        child: Widget.Box({
            class_name: "media-popup",
            child: Widget.EventBox({
                on_hover_lost: () => App.closeWindow("media"),
                child: Widget.Box({
                    vertical: true,
                    spacing: 10,
                    children: players.as(p => { return p.map(p => Player(p, "popup")) }),
                })
            }),
        }),
    })
}

