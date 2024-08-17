const mpris = await Service.import("mpris");
const notifications = await Service.import("notifications");


function custom_revealer(trigger, slider)
{
    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: slider,
    });

    const eventBox = Widget.EventBox({
        class_name: "button custom-revealer",
        vexpand: false,
        hexpand: false,
        on_hover: async (self) =>
        {
            revealer.reveal_child = true
            await new Promise(resolve => setTimeout(resolve, 5000));
            revealer.reveal_child = false
        },
        on_hover_lost: async () =>
        {
            await new Promise(resolve => setTimeout(resolve, 2000));
            revealer.reveal_child = false
        },
        child: Widget.Box({
            children: [trigger, revealer],
        }),
    });

    return eventBox;
}

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

    function truncateWithEllipsis(str, limit)
    {
        return str.length > limit ? str.slice(0, limit - 2) + "..." : str;
    }

    const { track_artists, track_title } = mpris.players[0];
    const title = `${truncateWithEllipsis(track_artists.join(", "), 20)} - ${truncateWithEllipsis(track_title, 20)}`;

    const label = Widget.Label({
        label: Utils.watch(title, mpris, "changed", () =>
        {
            if (mpris.players[0]) {
                return title
            } else {
                return 'Nothing is playing';
            }
        }),
    })

    const media = Widget.Button({
        on_primary_click: () => mpris.players[0].playPause(),
        on_scroll_up: () => mpris.players[0].next(),
        on_scroll_down: () => mpris.players[0].previous(),
        child: label,
    })

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
            VLC: "#FF5722",
            YouTube: "#FF0000",
            Brave: "#FF5722",
            Audacious: "#FF5722",
            Rhythmbox: "#FF5722",
            Chromium: "#FF5722",
            Firefox: "#FF5722",
        }

        return colors[name]
    }

    function getPlayerInfo()
    {
        return `
            color: ${playerToColor(mpris.players[0].name)};
            background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${mpris.players[0].track_cover_url}');
            `
    }

    return Widget.Box({
        class_name: "media",
        spacing: 5,
        children: [progress, media],
        css: Utils.watch(getPlayerInfo(), mpris, "changed", () => getPlayerInfo())

    })
}

function Clock()
{
    const date_less = Variable("", {
        poll: [1000, 'date "+%H:%M"'],
    });
    const date_more = Variable("", {
        poll: [1000, 'date "+:%S %b %e."'],
    });

    const revealer = Widget.Label({
        class_name: "label-left label",
        css: "color: #ffffff",
        label: date_more.bind()
    })
    const trigger = Widget.Label({
        class_name: "label-right label",
        label: date_less.bind()
    })

    return custom_revealer(trigger, revealer);

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

export function Center()
{
    return Widget.Box({
        spacing: 5,
        children: [Media(), Clock(), Bandwidth()],
    });
}
