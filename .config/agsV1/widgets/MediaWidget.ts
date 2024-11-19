import { Player } from "./Player";

const mpris = await Service.import("mpris");
const hyprland = await Service.import("hyprland");

const noPlayerFound = () => Widget.Box({
    hpack: "center",
    vpack: "center",
    hexpand: true,
    class_name: "module",
    child: Widget.Label({
        label: "No player found",
    })
})

const activePlayer = () =>
{

    if (mpris.players.length == 0) return noPlayerFound()

    const player = mpris.players.find(player => player.play_back_status === "Playing") || mpris.players[0]

    return Player(player, "widget")
}

const Media = () => Widget.Box({
}).hook(mpris, (self) => self.child = activePlayer(), "changed")


export default () => Media()
