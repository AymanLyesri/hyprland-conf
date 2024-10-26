import { Player } from "./Player";

const mpris = await Service.import("mpris");
const hyprland = await Service.import("hyprland");

const noPlayerFound = () => Widget.Box({
    hpack: "center",
    vpack: "center",
    hexpand: true,
    class_name: "module",
    child: Widget.Label({
        label: "No player active",
    })
})

const activePlayer = () =>
{

    const player = mpris.players.find(player => player.play_back_status === "Playing")

    if (!player) return noPlayerFound()

    return Player(player, "widget")
}

const Media = () => Widget.Box({
}).hook(mpris, (self) => self.child = activePlayer(), "changed")


export default () => Media()
