import Hyprland from "gi://AstalHyprland";
const hyprland = Hyprland.get_default();
import Mpris from "gi://AstalMpris";
const mpris = Mpris.get_default();

import { playerToColor } from "../../../utils/color";
import { lookupIcon, playerToIcon } from "../../../utils/icon";
import {
  date_less,
  date_more,
  emptyWorkspace,
  focusedClient,
  globalTransition,
} from "../../../variables";
import { bind, Variable } from "../../../../../../../usr/share/astal/gjs";
import { App, Astal, Gtk } from "astal/gtk3";
import CustomRevealer from "../../CustomRevealer";

function Media() {
  const progress = (player: Mpris.Player) => {
    const playerIcon = bind(player, "entry").as((e) => playerToIcon(e));
    return (
      <circularprogress
        className="progress"
        rounded={true}
        inverted={false}
        borderWidth={1}
        value={bind(player, "position").as((p) =>
          player.length > 0 ? p / player.length : 0
        )}
        child={
          // <icon className="icon" icon={playerIcon}/>
          <label css={"font-size:12px"} label={playerIcon} />
        }></circularprogress>
    );
  };

  const title = (player: Mpris.Player) => (
    <label
      className="label"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "title").as((t) => t || "Unknown Track")}></label>
  );

  const artist = (player: Mpris.Player) => (
    <label
      className="label"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "artist").as(
        (a) => `[${a}]` || "Unknown Artist"
      )}></label>
  );

  const coverArt = (player: Mpris.Player) =>
    bind(player, "coverArt").as(
      (c) => `
          color: ${playerToColor(player.entry)};
          background-image: linear-gradient(
              to right,
              #000000,
              rgba(0, 0, 0, 0.5)
            ),
            url("${c}");
        `
    );

  function Player(player: Mpris.Player) {
    return (
      <box className="media" css={coverArt(player)} spacing={10}>
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

  return (
    <revealer
      revealChild={bind(mpris, "players").as((arr) => arr.length > 0)}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      // setup={(self) =>
      //   bind(mpris, "players").as((arr) => (self.reveal_child = arr.length > 0))
      // }
      child={
        <eventbox
          className="media-event"
          onClick={() =>
            hyprland.message_async("dispatch workspace 4", (res) => print(res))
          }
          on_hover={() => {
            App.toggle_window("media");
          }}
          child={bind(mpris, "players").as((arr) =>
            arr.length > 0 ? activePlayer() : <box />
          )}></eventbox>
      }></revealer>
  );
}

function Clock() {
  const revealer = <label className="revealer" label={bind(date_more)}></label>;

  const trigger = <label className="trigger" label={bind(date_less)}></label>;

  return CustomRevealer(trigger, revealer, "clock");
}

function Bandwidth() {
  const bandwidth = Variable("").watch(
    `bash ./scripts/bandwidth.sh`,
    (out) => "↑" + JSON.parse(out)[0] + " ↓" + JSON.parse(out)[1]
  );

  const icon = <icon icon="network-wired-symbolic" />;
  const label = <label label={bind(bandwidth)}></label>;

  return (
    <box className="bandwidth" child={label}>
      {/* {icon} */}
    </box>
  );
}

function ClientTitle() {
  return (
    <revealer
      revealChild={emptyWorkspace.as((empty) => !empty)}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      child={focusedClient.as(
        (client) =>
          client && (
            <label
              className="client-title"
              truncate={true}
              max_width_chars={24}
              label={bind(client, "title").as(String)}
            />
          )
      )}></revealer>
  );
}

export default () => {
  return (
    <box className="bar-middle" spacing={5}>
      {/* <CavaWidget /> */}
      <Media />
      <Clock />
      <Bandwidth />
      <ClientTitle />
    </box>
  );
};
