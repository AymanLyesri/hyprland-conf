const mpris = await Service.import("mpris");
const notifications = await Service.import("notifications");

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

    function playerToBackground(name)
    {
        let color = "";
        switch (name) {
            case "spotify":
                color = "#1ED760";
                break;
            case "VLC media player":
                color = "#FF5722";
                break;
            case "YouTube":
                color = "#FF0000";
                break;
            case "Brave Browser":
                color = "#FF5722";
                break;
            case "Audacious":
                color = "#FF5722";
                break;
            case "Rhythmbox":
                color = "#FF5722";
                break;
            case "Chromium":
                color = "#FF5722";
                break;
            case "Firefox":
                color = "#FF5722";
                break;
            default:
                color = "#FF5722";
                break;
        }
        return color;
    }
    const label: string = Widget.Label({
        label: Utils.watch(`${mpris.players[0].track_artists.join(", ")} - ${mpris.players[0].track_title}`, mpris, "changed", () =>
        {
            if (mpris.players[0]) {
                const { track_artists, track_title } = mpris.players[0];
                return `${track_artists.join(", ")} - ${track_title}`;
            } else {
                return 'Nothing is playing';
            }
        }),
    })


    const media = Widget.Button({
        on_primary_click: () => mpris.getPlayer("")?.playPause(),
        on_scroll_up: () => mpris.getPlayer("")?.next(),
        on_scroll_down: () => mpris.getPlayer("")?.previous(),
        child: label,
    })

    let player = mpris.getPlayer("")

    const progress = Widget.CircularProgress({
        rounded: false,
        inverted: false,
        startAt: 0.75,
        // value: mpris.getPlayer("").bind('').as(p => p / 100),
        child: Widget.Icon({
            icon: "media-playback-start-symbolic",
        }),
        setup: self =>
        {
            function update()
            {
                const value = player?.position / player?.length
                self.value = value > 0 ? value : 0
            }
            self.hook(player, update)
            // self.hook(player, update, "position")
            self.poll(1000, update)
        },
    })

    // const revealer = Widget.Revealer({
    //     revealChild: false,
    //     transitionDuration: 1000,
    //     transition: 'slide_right',
    //     child: media,
    //     // setup: self => self.poll(2000, () =>
    //     // {
    //     //     self.reveal_child = !self.reveal_child;
    //     // }),
    // });

    return Widget.Box({
        class_name: "media",
        children: [media],
        css: `background: ${playerToBackground(mpris.getPlayer("")?.name)};
        color: ${getComplementaryColor(playerToBackground(mpris.getPlayer("")?.name))}
        `,
    })
}

// const mpris = await Service.import('mpris')




function Clock()
{
    const date = Variable("", {
        poll: [1000, 'date "+%H:%M:%S %b %e."'],
    });

    return Widget.Label({
        class_name: "clock",
        label: date.bind(),
    });
}



function Bandwidth()
{
    const bandwidth = Variable("", {
        // listen to an array of [up, down] values
        listen: [App.configDir + '/scripts/bandwidth.sh', out =>
        {
            return " ↑ " + JSON.parse(out)[0] + " ↓ " + JSON.parse(out)[1];
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

export function Center()
{
    return Widget.Box({
        spacing: 5,
        children: [Media(), Clock(), Bandwidth(), Notification()],
    });
}
