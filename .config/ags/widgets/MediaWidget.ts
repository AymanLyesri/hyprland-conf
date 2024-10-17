import { Player } from "./Player";

const mpris = await Service.import("mpris");
const hyprland = await Service.import("hyprland");


const activePlayer = () => Player(mpris.players.find(player => player.play_back_status === "Playing") || mpris.players[0], "widget")

const Media = () => Widget.EventBox({
    class_name: "media-event",
    on_primary_click: () => hyprland.messageAsync("dispatch workspace 4").catch(err => print(err)),

    child: Widget.Box({
        child: Utils.watch(mpris.players.length > 0 ? activePlayer() : Widget.Box(),
            mpris, "changed",
            () => activePlayer()),
    })

})


export default () => Media()



// function activePlayer(player: MprisPlayer)
// {
//     const dominantColor = player.bind("cover_path").as((path) => getDominantColor(path))

//     const progress = () => Widget.CircularProgress({
//         class_name: "progress",
//         rounded: true,
//         inverted: false,
//         startAt: 0.75,
//         child: Widget.Label({
//             label: playerToIcon(player.name),
//         }),
//         setup: self =>
//         {
//             function update()
//             {
//                 const value = player.position / player.length
//                 self.value = value > 0 ? value : 0
//             }
//             self.poll(1000, update)
//         },
//     })

//     const title = () => Widget.Label({
//         class_name: "label",
//         max_width_chars: 20,
//         truncate: "end",
//         label: player.track_title + " -- ",
//     })

//     const artist = () => Widget.Label({
//         class_name: "label",
//         max_width_chars: 20,
//         truncate: "end",
//         label: player.track_artists.join(" -- "),
//     })
//     const positionLabel = Widget.Label({
//         class_name: "position",
//         hpack: "start",
//         setup: self =>
//         {
//             const update = (_, time) =>
//             {
//                 self.label = lengthStr(time || player.position)
//                 self.visible = player.length > 0
//             }

//             self.hook(player, update, "position")
//             self.poll(1000, update as any)
//         },
//     })

//     const positionSlider = Widget.Slider({
//         class_name: "slider",
//         draw_value: false,
//         css: dominantColor.as(c => `highlight{background: ${c}}`),
//         on_change: ({ value }) => player.position = value * player.length,
//         visible: player.bind("length").as(l => l > 0),
//         setup: self =>
//         {
//             function update()
//             {
//                 const value = player.position / player.length
//                 self.value = value > 0 ? value : 0
//             }
//             self.hook(player, update)
//             self.hook(player, update, "position")
//             self.poll(1000, update)
//         },
//     })

//     const top = Widget.Box({
//         spacing: 5,
//         children: [title(), artist()]
//     })

//     return Widget.Box({
//         class_name: "media-widget player",
//         spacing: 5,
//         vertical: true,
//         children: [top, positionSlider],
//         css: `
//             color: ${playerToColor(player.name)};
//             background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${player.cover_path}');
//             `,
//     })
// }
