import Hyprland from "gi://AstalHyprland";
const hyprland = Hyprland.get_default();
import Mpris from "gi://AstalMpris";
const mpris = Mpris.get_default();

import { playerToColor } from "../../../utils/color";
import { playerToIcon } from "../../../utils/icon";
import {
  date_less,
  date_more,
  emptyWorkspace,
  globalTransition,
} from "../../../variables";
import {
  CircularProgress,
  EventBox,
  Revealer,
} from "../../../../../../../usr/share/astal/gjs/gtk3/widget";
import { bind, Variable } from "../../../../../../../usr/share/astal/gjs";
import Astal from "gi://Astal?version=3.0";
import { custom_revealer } from "../../revealer";

function Media() {
  // const progress = (player: any) => Widget.CircularProgress({
  //     class_name: "progress",
  //     rounded: true,
  //     inverted: false,
  //     startAt: 0.75,
  //     child: Widget.Label({
  //         label: playerToIcon(player.name),
  //     }),
  //     setup: self =>
  //     {
  //         function update()
  //         {
  //             const value = player.position / player.length
  //             self.value = value > 0 ? value : 0
  //         }
  //         self.poll(1000, update)
  //     },
  // })

  const progress = (player: Mpris.Player) => {
    const playerIcon = bind(player, "entry").as((e) =>
      Astal.Icon.lookup_icon(e) ? e : "audio-x-generic-symbolic"
    );
    return (
      <CircularProgress
        className="progress"
        rounded={true}
        inverted={false}
        startAt={0.75}
        value={player.position / player.length}>
        <icon className="icon" icon={playerIcon} />
      </CircularProgress>
    );
  };

  //   const title = (player: MprisPlayer) =>
  //     Widget.Label({
  //       class_name: "label",
  //       max_width_chars: 20,
  //       truncate: "end",
  //       label: player.track_title + " -- ",
  //     });

  const title = (player: Mpris.Player) => (
    <label
      className="label"
      max_width_chars={20}
      truncate={true}
      label={player.title}></label>
  );

  //   const artist = (player: MprisPlayer) =>
  //     Widget.Label({
  //       class_name: "label",
  //       max_width_chars: 20,
  //       truncate: "end",
  //       label: player.track_artists.join(" -- "),
  //     });

  const artist = (player: Mpris.Player) => (
    <label
      className="label"
      max_width_chars={20}
      truncate={true}
      label={player.artist}></label>
  );

  //   function Player(player: MprisPlayer) {
  //     return Widget.Box({
  //       class_name: "media",
  //       spacing: 5,
  //       children: [progress(player), title(player), artist(player)],
  //       css: `
  //             color: ${playerToColor(player.name)};
  //             background-image:  linear-gradient(to right, #000000 , rgba(0, 0, 0, 0.5)), url('${
  //               player.cover_path
  //             }');
  //             `,
  //     });
  //   }

  function Player(player: Mpris.Player) {
    return (
      <box
        className="media"
        css={`
          color: ${playerToColor(player.entry)};
          background-image: linear-gradient(
              to right,
              #000000,
              rgba(0, 0, 0, 0.5)
            ),
            url("${player.cover_art}");
        `}>
        {progress(player)}
        {title(player)}
        {artist(player)}
      </box>
    );
  }

  const activePlayer = () =>
    Player(
      mpris.players.find(
        (player) => player.playbackStatus === Mpris.PlaybackStatus.PLAYING
      ) || mpris.players[0]
    );

  //   return Widget.Revealer({
  //     transitionDuration: globalTransition,
  //     transition: "slide_left",
  //     child: Widget.EventBox({
  //       class_name: "media-event",
  //       on_primary_click: () =>
  //         hyprland
  //           .messageAsync("dispatch workspace 4")
  //           .catch((err) => print(err)),
  //       on_hover: () => App.openWindow("media"),

  //       child: Utils.watch(
  //         mpris.players.length > 0 ? activePlayer() : Widget.Box(),
  //         mpris,
  //         "changed",
  //         () => activePlayer()
  //       ),
  //     }),
  //     setup: (self) =>
  //       self.hook(
  //         mpris,
  //         () => (self.reveal_child = mpris.players.length > 0),
  //         "changed"
  //       ),
  //   });

  return (
    <Revealer
      transitionDuration={globalTransition}
      // transitionType={"slide_left"}
    >
      <EventBox
        className="media-event"
        onClick={
          () =>
            hyprland.message_async("dispatch workspace 4", (res) => print(res))
          // .catch((err) => print(err))
        }
        on_hover={() => {}}
        // setup={
        //   (self) =>
        //     self.hook(
        //       mpris,
        //       "changed",
        //       () => (self. = mpris.players.length > 0)
        //     )
        //   // self.hook(mpris, () => (self.reveal_child = mpris.players.length > 0), "changed")
        // }
      ></EventBox>
    </Revealer>
  );
}

function Clock() {
  // const revealer = Widget.Label({
  //   class_name: "revealer",
  //   label: date_more.bind(),
  // });

  const revealer = <label className="revealer" label={bind(date_more)}></label>;
  // const trigger = Widget.Label({
  //   class_name: "trigger",
  //   label: date_less.bind(),
  // });

  const trigger = <label className="trigger" label={bind(date_more)}></label>;

  return custom_revealer(trigger, revealer, "clock");
}

function Bandwidth() {
  // const bandwidth = Variable("", {
  //   // listen to an array of [up, down] values
  //   listen: [
  //     `bash ${App.configDir}/scripts/bandwidth.sh`,
  //     (out) => {
  //       return "↑" + JSON.parse(out)[0] + " ↓" + JSON.parse(out)[1];
  //     },
  //   ],
  // });
  // // const icon = Widget.Icon({ icon: "network-wired-symbolic" });
  // const label = Widget.Label({
  //   label: bandwidth.bind(),
  // });
  // return Widget.Box({
  //   class_name: "bandwidth",
  //   child: label,
  // });

  const bandwidth = Variable("").watch(
    `bash ./scripts/bandwidth.sh`,
    (out) => "↑" + JSON.parse(out)[0] + " ↓" + JSON.parse(out)[1]
  );

  const icon = <icon icon="network-wired-symbolic" />;
  const label = <label label={bind(bandwidth)}></label>;

  return (
    <box className="bandwidth">
      {icon}
      {label}
    </box>
  );
}

function ClientTitle() {
  // return Widget.Revealer({
  //   revealChild: emptyWorkspace.as((empty) => !empty),
  //   transitionDuration: globalTransition,
  //   transition: "slide_right",
  //   child: Widget.Label({
  //     class_name: "client-title",
  //     truncate: "end",
  //     max_width_chars: 24,
  //     label: hyprland.active.client.bind("title"),
  //   }),
  // });

  return (
    <Revealer
      revealChild={true}
      transitionDuration={globalTransition}
      // transitionType={"slide_right"}
    >
      <label
        className="client-title"
        truncate={true}
        max_width_chars={24}></label>
    </Revealer>
  );
}

export function Center() {
  // return Widget.Box({
  //   class_name: "bar-middle",
  //   spacing: 5,
  //   children: [
  //     CavaWidget("middle"),
  //     Media(),
  //     Clock(),
  //     Bandwidth(),
  //     ClientTitle(),
  //   ],
  // });

  return (
    <box className="bar-middle" spacing={5}>
      {/* <CavaWidget /> */}
      <Media />
      <Clock />
      <Bandwidth />
      <ClientTitle />
    </box>
  );
}
