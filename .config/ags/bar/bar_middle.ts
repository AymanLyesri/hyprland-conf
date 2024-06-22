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
    const label = Widget.Label({
        label: Utils.watch("", mpris, "changed", () =>
        {
            if (mpris.players[0]) {
                const { track_artists, track_title } = mpris.players[0];
                return `${track_artists.join(", ")} - ${track_title}`;
            } else {
                return "Nothing is playing";
            }
        }),
    })

    const media = Widget.Button({
        on_primary_click: () => mpris.getPlayer("")?.playPause(),
        on_scroll_up: () => mpris.getPlayer("")?.next(),
        on_scroll_down: () => mpris.getPlayer("")?.previous(),
        child: label,
    })

    const revealer = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_right',
        child: media,
        // setup: self => self.poll(2000, () =>
        // {
        //   self.reveal_child = !self.reveal_child;
        // }),
    });

    const trigger = Widget.Button({
        on_hover: () => revealer.reveal_child = true,
        on_hover_lost: () => setTimeout(() => revealer.reveal_child = false, 5000),
        child: Widget.Icon({ icon: "media-playback-start-symbolic" }),
        class_name: "media-trigger",
    });

    return Widget.Box({
        class_name: "media",
        children: [trigger, revealer]
    })
}



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
