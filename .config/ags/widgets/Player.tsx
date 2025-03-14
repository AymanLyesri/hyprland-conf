import { bind } from "astal";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { getDominantColor } from "../utils/image";
import { Gtk } from "astal/gtk3";
import { rightPanelWidth } from "../variables";

const FALLBACK_ICON = "audio-x-generic-symbolic";
const PLAY_ICON = "media-playback-start-symbolic";
const PAUSE_ICON = "media-playback-pause-symbolic";
const PREV_ICON = "media-skip-backward-symbolic";
const NEXT_ICON = "media-skip-forward-symbolic";

function lengthStr(length: number) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

export default ({
  player,
  playerType,
}: {
  player: AstalMpris.Player;
  playerType: "popup" | "widget";
}) => {
  const dominantColor = bind(player, "coverArt").as((path) =>
    getDominantColor(path)
  );
  const img = () => {
    if (playerType == "widget") return <box></box>;

    return (
      <box
        valign={Gtk.Align.CENTER}
        child={
          <box
            className="img"
            css={bind(player, "coverArt").as(
              (p) => `
                    background-image: url('${p}');
                    box-shadow: 0 0 5px 0 ${getDominantColor(p)};
                `
            )}
          />
        }></box>
    );
  };
  const title = (
    <label
      className="title"
      max_width_chars={20}
      halign={Gtk.Align.START}
      truncate={true}
      label={bind(player, "title").as((t) => t || "Unknown Track")}></label>
  );

  const artist = (
    <label
      className="artist"
      max_width_chars={20}
      halign={Gtk.Align.START}
      truncate={true}
      label={bind(player, "artist").as((a) => a || "Unknown Artist")}></label>
  );

  const positionSlider = (
    <slider
      className="slider"
      css={dominantColor.as((c) => `highlight{background: ${c}00}`)}
      onDragged={({ value }) => (player.position = value * player.length)}
      visible={bind(player, "length").as((l) => l > 0)}
      value={bind(player, "position").as((p) =>
        player.length > 0 ? p / player.length : 0
      )}
    />
  );

  const positionLabel = (
    <label
      className="position"
      halign={Gtk.Align.START}
      label={bind(player, "position").as(lengthStr)}
      visible={bind(player, "length").as((l) => l > 0)}></label>
  );
  const lengthLabel = (
    <label
      className="length"
      halign={Gtk.Align.END}
      visible={bind(player, "length").as((l) => l > 0)}
      label={bind(player, "length").as(lengthStr)}></label>
  );

  // const icon = Widget.icon({
  //   class_name: "icon",
  //   hexpand: true,
  //   hpack: "end",
  //   vpack: "center",
  //   tooltip_text: player.identity || "",
  //   icon: player.bind("entry").transform((entry) => {
  //     const name = `${entry}-symbolic`;
  //     return Utils.lookUpicon(name) ? name : FALLBACK_ICON;
  //   }),
  // });
  const icon = (
    <box halign={Gtk.Align.END} valign={Gtk.Align.CENTER}>
      {/* <icon
        className="icon"
        tooltip_text={bind(player, "identity").as((i) => i || "")}
        icon={bind(player, "entry").as((entry) => {
          const name = `${entry}-symbolic`;
          return Gtk.Utils.lookUpicon(name) ? name : FALLBACK_ICON;
        })}></icon> */}
    </box>
  );

  const playPause = (
    <button
      on_clicked={() => player.play_pause()}
      className="play-pause"
      visible={bind(player, "can_play").as((c) => c)}
      child={
        <icon
          icon={bind(player, "playbackStatus").as((s) => {
            switch (s) {
              case AstalMpris.PlaybackStatus.PLAYING:
                return PAUSE_ICON;
              case AstalMpris.PlaybackStatus.PAUSED:
              case AstalMpris.PlaybackStatus.STOPPED:
                return PLAY_ICON;
            }
          })}></icon>
      }></button>
  );

  const prev = (
    <button
      on_clicked={() => player.previous()}
      visible={bind(player, "can_go_previous").as((c) => c)}
      child={<icon icon={PREV_ICON}></icon>}></button>
  );

  const next = (
    <button
      on_clicked={() => player.next()}
      visible={bind(player, "can_go_next").as((c) => c)}
      child={<icon icon={NEXT_ICON}></icon>}></button>
  );

  return (
    <box
      className={`player ${playerType}`}
      vexpand={false}
      css={bind(player, "coverArt").as((p) =>
        playerType == "widget"
          ? `
              min-height:${rightPanelWidth.get()}px;
              background-image: url('${p}');
              `
          : ``
      )}
      child={
        <box className={"player-content"} vexpand={true}>
          {img()}
          <box vertical={true} hexpand={true} spacing={5}>
            <box>
              {artist}
              {icon}
            </box>
            <box vexpand={true}></box>
            {title}
            {positionSlider}
            <centerbox>
              {positionLabel}
              <box>
                {prev}
                {playPause}
                {next}
              </box>
              {lengthLabel}
            </centerbox>
          </box>
        </box>
      }
    />
  );
};
