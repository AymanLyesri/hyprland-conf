const hyprland = await Service.import("hyprland");
const mpris = await Service.import("mpris");

import { MprisPlayer } from "types/service/mpris";
import { playerToColor } from "utils/color";
import { playerToIcon } from "utils/icon";
import { date_less, date_more, emptyWorkspace, globalTransition } from "variables";
import CavaWidget from "widgets/Cava";
import { custom_revealer } from "widgets/revealer";


function Media()
{
    const progress = (player: MprisPlayer) => Widget.CircularProgress({
        class_name: "progress",
        rounded: true,
        inverted: false,
        startAt: 0.75,
        child: Widget.Label({
            label: playerToIcon(player.name),
        }),
        setup: self =>
        {
            function update()
            {
                const value = player.position / player.length
                self.value = value > 0 ? value : 0
            }
            self.poll(1000, update)
        },
    })

    const title = (player: MprisPlayer) => Widget.Label({
        class_name: "label",
        max_width_chars: 20,
        truncate: "end",
        label: player.track_title + " -- ",
    })

    const artist = (player: MprisPlayer) => Widget.Label({
        class_name: "label",
        max_width_chars: 20,
        truncate: "end",
        label: player.track_artists.join(" -- "),
    })

    function Player(player: MprisPlayer)
    {
        return Widget.Box({
            class_name: "media",
            spacing: 5,
            children: [progress(player), title(player), artist(player)],
            css: `
            color: ${playerToColor(player.name)};
            background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${player.cover_path}');
            `,
        })
    }

    const activePlayer = () => Player(mpris.players.find(player => player.play_back_status === "Playing") || mpris.players[0])

    return Widget.Revealer({
        transitionDuration: globalTransition,
        transition: 'slide_left',
        child: Widget.EventBox({
            class_name: "media-event",
            on_primary_click: () => hyprland.messageAsync("dispatch workspace 4").catch(err => print(err)),
            on_hover: () => App.openWindow("media"),

            child: Utils.watch(mpris.players.length > 0 ? activePlayer() : Widget.Box(),
                mpris, "changed",
                () => activePlayer()),

        }),
        setup: self => self.hook(mpris, () => self.reveal_child = mpris.players.length > 0, "changed")
    })
}

function Clock()
{
    const revealer = Widget.Label({
        class_name: "revealer",
        label: date_more.bind()
    })
    const trigger = Widget.Label({
        class_name: "trigger",
        label: date_less.bind()
    })

    return custom_revealer(trigger, revealer, "clock");
}

function Bandwidth()
{
    const bandwidth = Variable("", {
        // listen to an array of [up, down] values
        listen: [`bash ${App.configDir}/scripts/bandwidth.sh`, out =>
        {
            return "↑" + JSON.parse(out)[0] + " ↓" + JSON.parse(out)[1];
        }],
    });

    // const icon = Widget.Icon({ icon: "network-wired-symbolic" });
    const label = Widget.Label({
        label: bandwidth.bind(),
    });

    return Widget.Box({
        class_name: "bandwidth",
        child: label,
    });
}

function ClientTitle()
{
    return Widget.Revealer({
        revealChild: emptyWorkspace.as(empty => !empty),
        transitionDuration: globalTransition,
        transition: 'slide_right',
        child: Widget.Label({
            class_name: "client-title",
            truncate: "end",
            max_width_chars: 24,
            label: hyprland.active.client.bind("title"),
        })
    })
}

export default () =>
{
    return Widget.Box({
        class_name: 'bar-middle',
        spacing: 5,
        children: [CavaWidget("middle"), Media(), Clock(), Bandwidth(), ClientTitle()],
    });
}
