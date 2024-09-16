const hyprland = await Service.import("hyprland");
const mpris = await Service.import("mpris");
const notifications = await Service.import("notifications");

import { emptyWorkspace, mediaVisibility } from "variables";
import { custom_revealer } from "widgets/revealer";

const Player = mpris.bind("players").as(players => players[0])

function Media()
{



    function getComplementaryColor(hex: string): string
    {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');

        // Parse the r, g, b values
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Get the complementary color
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;

        // Convert back to a hex string and return
        return '#' + [r, g, b].map(x =>
        {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }


    function playerToIcon(name)
    {
        let icons = {
            spotify: "󰓇",
            VLC: "󰓈",
            YouTube: "󰓉",
            Brave: "󰓊",
            Audacious: "󰓋",
            Rhythmbox: "󰓌",
            Chromium: "󰓍",
            Firefox: "󰈹",
            firefox: "󰈹",
        }

        return icons[name]
    }

    const progress = (player) => Widget.CircularProgress({
        class_name: "progress",
        rounded: true,
        inverted: false,
        startAt: 0.75,
        child: Widget.Label({
            label: player.bind("name").as(playerToIcon),
        }),
        setup: self =>
        {
            function update()
            {
                const value = player.position / player.length
                self.value = value > 0 ? value : 0
            }
            self.hook(player, update)
            // self.hook(player, update, "position")
            self.poll(1000, update)
        },
    })

    function playerToColor(name)
    {
        let colors = {
            spotify: "#1ED760",
            VLC: "#FF9500",
            YouTube: "#FF0000",
            Brave: "#FF9500",
            Audacious: "#FF9500",
            Rhythmbox: "#FF9500",
            Chromium: "#FF9500",
            Firefox: "#FF9500",
            firefox: "#FF9500",
        }

        return colors[name]
    }

    // const truncateWithEllipsis = (str, limit) =>
    // {
    //     return str.length > limit ? str.slice(0, limit - 2) + "..." : str;
    // }

    // const toTitle = (player) =>
    // {
    //     var { track_artists, track_title } = player;
    //     return `${truncateWithEllipsis(track_artists.join(", "), 20)} - ${truncateWithEllipsis(track_title, 20)}`
    // };

    const title = (player) => Widget.Label({
        class_name: "label",
        max_width_chars: 20,
        truncate: "end",
        label: player.bind("track_title"),
    })

    const artist = (player) => Widget.Label({
        class_name: "label",
        max_width_chars: 20,
        truncate: "end",
        label: player.bind("track_artists").transform(a => "-- " + a.join(", ")),
    })

    const activePlayer = (player) => Widget.Box({
        class_name: "media",
        spacing: 5,
        children: [progress(player), title(player), artist(player)],
        css: player.bind("track_cover_url").as(t => `
            color: ${playerToColor(player.name)};
            background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${player.track_cover_url}');
            `,
        ),
    })

    return Widget.EventBox({
        class_name: "media-event",
        // on_primary_click: () => Utils.execAsync(`ags -t media`).catch(err => print(err)),
        on_secondary_click: () => hyprland.messageAsync("dispatch workspace 4"),
        // on_scroll_up: () => Player.next(),
        // on_scroll_down: () => Player.previous(),
        on_hover: () => mediaVisibility.value = true,

        child: Utils.watch(activePlayer(mpris.players[0]), mpris, "changed", () => activePlayer(mpris.players.find(player => player.play_back_status === "Playing"))),
        // child: Utils.merge([mpris.bind("players"), mpris.bind("players").as(players =>
        // {
        //     return players.map(player => player.bind("play_back_status"));
        // })
        // ], (players, b) =>
        // {
        //     print(players)
        //     // const active = players.find(player => player.play_back_status === "Playing") || players[0]
        //     const active = players[0]
        //     // print("AAAAAAAACTIIIIIVE", active.play_back_status)
        //     // return Widget.Label({
        //     //     label: active ? toTitle(active) : "No media playing",
        //     // })
        //     return activePlayer(active)

        // })

    })
}




function Clock()
{
    const date_less = Variable("", {
        poll: [1000, 'date "+%H:%M"'],
    });
    const date_more = Variable("", {
        poll: [1000, 'date "+:%S %b %e, %A."']
    });

    const revealer = Widget.Label({
        css: "margin: 0px;",
        label: date_more.bind()
    })
    const trigger = Widget.Label({
        label: date_less.bind()
    })

    return custom_revealer(trigger, revealer, "date");

}

function Bandwidth()
{
    const bandwidth = Variable("", {
        // listen to an array of [up, down] values
        listen: [App.configDir + '/scripts/bandwidth.sh', out =>
        {
            return " ↑" + JSON.parse(out)[0] + " ↓" + JSON.parse(out)[1];
        }],
    });

    const icon = Widget.Icon({ icon: "network-wired-symbolic" });
    const label = Widget.Label({
        label: bandwidth.bind(),
    });

    return Widget.Box({
        class_name: "bandwidth",
        children: [icon, label],
    });
}

function ClientTitle()
{
    return Widget.Revealer({
        revealChild: emptyWorkspace.as(empty => !empty),
        transitionDuration: 1000,
        transition: 'slide_right',
        child: Widget.Label({
            class_name: "client-title",
            truncate: "end",
            max_width_chars: 24,
            label: hyprland.active.client.bind("title"),
        })
    })
}


export function Center()
{
    return Widget.Box({
        class_name: 'bar-middle',
        spacing: 5,
        children: [Media(), Clock(), Bandwidth(), ClientTitle()],
    });
}
