const hyprland = await Service.import("hyprland");
const mpris = await Service.import("mpris");
const notifications = await Service.import("notifications");

import { mediaVisibility } from "variables";
import { custom_revealer } from "widgets/revealer";


// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification()
{
    const popups = notifications.bind("popups");
    return Widget.Box({
        class_name: "notification",
        visible: popups.as((p) => p.length > 0),
        children: [
            Widget.Icon({
                icon: "preferences-system-notifications-symbolic",
            }),
            Widget.Label({
                label: popups.as((p) => p[0]?.summary || ""),
            }),
        ],
    });
}

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

    const progress = Widget.CircularProgress({
        class_name: "progress",
        rounded: true,
        inverted: false,
        startAt: 0.75,
        child: Widget.Label({
            label: playerToIcon(mpris.players[0].name),
        }),
        setup: self =>
        {
            function update()
            {
                const value = mpris.players[0].position / mpris.players[0].length
                self.value = value > 0 ? value : 0
            }
            self.hook(mpris.players[0], update)
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

    const truncateWithEllipsis = (str, limit) =>
    {
        return str.length > limit ? str.slice(0, limit - 2) + "..." : str;
    }

    const title = () =>
    {
        var { track_artists, track_title } = mpris.players[0];
        return `${truncateWithEllipsis(track_artists.join(", "), 20)} - ${truncateWithEllipsis(track_title, 20)}`
    };

    const label = Widget.Label({
        class_name: "label",
        label: Utils.watch(title(), mpris, "changed", () => title()),
    })

    const getPlayerCss = () => `
            color: ${playerToColor(mpris.players[0].name)};
            background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${mpris.players[0].track_cover_url}');
            `

    return Widget.EventBox({
        class_name: "media-event",
        // on_primary_click: () => Utils.execAsync(`ags -t media`).catch(err => print(err)),
        on_secondary_click: () => hyprland.messageAsync("dispatch workspace 4"),
        on_scroll_up: () => mpris.players[0].next(),
        on_scroll_down: () => mpris.players[0].previous(),
        on_hover: () => mediaVisibility.value = true,
        child: Widget.Box({
            class_name: "media",
            spacing: 5,
            children: [progress, label],
            css: Utils.watch(getPlayerCss(), mpris, "changed", () => getPlayerCss())

        })
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

const calendar = Widget.Calendar({
    showDayNames: true,
    showDetails: true,
    showHeading: true,
    showWeekNumbers: true,
    detail: (self, y, m, d) =>
    {
        return `<span color="white">${y}. ${m}. ${d}.</span>`
    },
    onDaySelected: ({ date: [y, m, d] }) =>
    {
        print(`${y}. ${m}. ${d}.`)
    },
})

function ClientTitle()
{
    return Widget.Revealer({
        revealChild: hyprland.active.client.bind("title").as(title => title.length > 0),
        transitionDuration: 1000,
        transition: 'slide_right',
        child: Widget.Label({
            class_name: "client-title",
            // css: 'margin: 0px 15px',
            truncate: "end",
            max_width_chars: 24,
            // css: hyprland.active.client.bind("title").as(title => title.length > 0 ? "opacity: 1" : "opacity: 0"),
            // visible: hyprland.active.client.bind("title").as(title => title.length > 0),
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
