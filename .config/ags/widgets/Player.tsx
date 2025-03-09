import { bind } from "astal";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { getDominantColor } from "../utils/image";
import { Box, Button, CenterBox, Icon, Label, Slider } from "astal/gtk3/widget";
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

/** @param {import('types/service/mpris').MprisPlayer} player */
export function Player(
  player: AstalMpris.Player,
  playerType: "popup" | "widget"
) {
  const dominantColor = bind(player, "coverArt").as((path) =>
    getDominantColor(path)
  );
  const img = () => {
    if (playerType == "widget") return <Box></Box>;

    // return Widget.Box({
    //     vpack: "center",
    //     child: Widget.Box({
    //         class_name: "img",
    //         css: player.bind("cover_path").transform(p => `
    //     background-image: url('${p}');
    //     box-shadow: 0 0 5px 0 ${getDominantColor(p)};
    //         `),
    //     })
    // })
    return (
      <Box valign={Gtk.Align.CENTER}>
        <Box
          className="img"
          css={bind(player, "coverArt").as(
            (p) => `
                    background-image: url('${p}');
                    box-shadow: 0 0 5px 0 ${getDominantColor(p)};
                `
          )}
        />
      </Box>
    );
  };

  //   const title = Widget.Label({
  //     class_name: "title",
  //     truncate: "end",
  //     hexpand: true,
  //     hpack: "start",
  //     vpack: "start",
  //     label: player.bind("track_title"),
  //   });
  const title = (
    <Label
      className="title"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "title").as((t) => t || "Unknown Track")}></Label>
  );

  //   const artist = Widget.Label({
  //     class_name: "artist",
  //     truncate: "end",
  //     hpack: "start",
  //     label: player.bind("track_artists").transform((a) => a.join(", ")),
  //   });
  const artist = (
    <Label
      className="artist"
      max_width_chars={20}
      truncate={true}
      label={bind(player, "artist").as((a) => a || "Unknown Artist")}></Label>
  );

  //   const positionSlider = Widget.Slider({
  //     class_name: "slider",
  //     draw_value: false,
  //     css: dominantColor.as((c) => `highlight{background: ${c}00}`),
  //     on_change: ({ value }) => (player.position = value * player.length),
  //     visible: player.bind("length").as((l) => l > 0),
  //     setup: (self) => {
  //       function update() {
  //         const value = player.position / player.length;
  //         self.value = value > 0 ? value : 0;
  //       }
  //       self.hook(player, update);
  //       self.hook(player, update, "position");
  //       self.poll(1000, update);
  //     },
  //   });
  const positionSlider = (
    <Slider
      className="slider"
      draw_value={false}
      css={dominantColor.as((c) => `highlight{background: ${c}00}`)}
      onDragged={({ value }) => (player.position = value * player.length)}
      visible={bind(player, "length").as((l) => l > 0)}
      value={bind(player, "position").as((p) =>
        player.length > 0 ? p / player.length : 0
      )}
      // setup={(self) => {
      //   function update() {
      //     const value = player.position / player.length;
      //     self.value = value > 0 ? value : 0;
      //   }
      //   self.hook(player, "changed", update);
      //   self.hook(player, "position", update);
      //   // self.poll(1000, update);
      // }}
    />
  );

  //   const positionLabel = Widget.Label({
  //     class_name: "position",
  //     hpack: "start",
  //     setup: (self) => {
  //       const update = (_, time) => {
  //         self.label = lengthStr(time || player.position);
  //         self.visible = player.length > 0;
  //       };

  //       self.hook(player, update, "position");
  //       self.poll(1000, update as any);
  //     },
  //   });
  const positionLabel = (
    <Label
      className="position"
      halign={Gtk.Align.START}
      label={bind(player, "position").as(lengthStr)}
      visible={bind(player, "length").as((l) => l > 0)}
      // setup={(self) => {
      //   const update = (_: any, time: any) => {
      //     self.label = lengthStr(time || player.position);
      //     self.visible = player.length > 0;
      //   };

      //   self.hook(player, "position", update);
      //   // self.poll(1000, update as any);
      // }}
    ></Label>
  );

  // const lengthLabel = Widget.Label({
  //   class_name: "length",
  //   hpack: "end",
  //   visible: player.bind("length").transform((l) => l > 0),
  //   label: player.bind("length").transform(lengthStr),
  // });
  const lengthLabel = (
    <Label
      className="length"
      halign={Gtk.Align.END}
      visible={bind(player, "length").as((l) => l > 0)}
      label={bind(player, "length").as(lengthStr)}></Label>
  );

  // const icon = Widget.Icon({
  //   class_name: "icon",
  //   hexpand: true,
  //   hpack: "end",
  //   vpack: "center",
  //   tooltip_text: player.identity || "",
  //   icon: player.bind("entry").transform((entry) => {
  //     const name = `${entry}-symbolic`;
  //     return Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
  //   }),
  // });
  const icon = (
    <Box halign={Gtk.Align.END} valign={Gtk.Align.CENTER}>
      {/* <Icon
        className="icon"
        tooltip_text={bind(player, "identity").as((i) => i || "")}
        icon={bind(player, "entry").as((entry) => {
          const name = `${entry}-symbolic`;
          return Gtk.Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
        })}></Icon> */}
    </Box>
  );

  // const playPause = Widget.Button({
  //   class_name: "play-pause",
  //   on_clicked: () => player.playPause(),
  //   visible: player.bind("can_play"),
  //   child: Widget.Icon({
  //     icon: player.bind("play_back_status").transform((s) => {
  //       switch (s) {
  //         case "Playing":
  //           return PAUSE_ICON;
  //         case "Paused":
  //         case "Stopped":
  //           return PLAY_ICON;
  //       }
  //     }),
  //   }),
  // });
  const playPause = (
    <Button
      on_clicked={() => player.play_pause()}
      className="play-pause"
      visible={bind(player, "can_play").as((c) => c)}>
      <Icon
        icon={bind(player, "playbackStatus").as((s) => {
          switch (s) {
            case AstalMpris.PlaybackStatus.PLAYING:
              return PAUSE_ICON;
            case AstalMpris.PlaybackStatus.PAUSED:
            case AstalMpris.PlaybackStatus.STOPPED:
              return PLAY_ICON;
          }
        })}></Icon>
    </Button>
  );

  // const prev = Widget.Button({
  //   on_clicked: () => player.previous(),
  //   visible: player.bind("can_go_prev"),
  //   child: Widget.Icon(PREV_ICON),
  // });
  const prev = (
    <Button
      on_clicked={() => player.previous()}
      visible={bind(player, "can_go_previous").as((c) => c)}>
      <Icon icon={PREV_ICON}></Icon>
    </Button>
  );

  // const next = Widget.Button({
  //   on_clicked: () => player.next(),
  //   visible: player.bind("can_go_next"),
  //   child: Widget.Icon(NEXT_ICON),
  // });
  const next = (
    <Button
      on_clicked={() => player.next()}
      visible={bind(player, "can_go_next").as((c) => c)}>
      <Icon icon={NEXT_ICON}></Icon>
    </Button>
  );

  // return Widget.EventBox(
  //   { class_name: "player-event" },
  //   Widget.Box(
  //     {
  //       vexpand: false,
  //       class_name: `player ${playerType}`,
  //       css:
  //         playerType == "widget"
  //           ? `
  //           min-height:${rightPanelWidth.value}px;
  //           background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  //               url('${player.cover_path}');
  //           `
  //           : ``,
  //     },
  //     img(),
  //     Widget.Box(
  //       {
  //         vertical: true,
  //         hexpand: true,
  //         spacing: 5,
  //       },
  //       Widget.Box({
  //         children: [artist, icon],
  //       }),
  //       Widget.Box({ vexpand: true }), // spacer
  //       title,
  //       positionSlider,
  //       Widget.CenterBox({
  //         start_widget: positionLabel,
  //         center_widget: Widget.Box({
  //           children: [prev, playPause, next],
  //         }),
  //         end_widget: lengthLabel,
  //       })
  //     )
  //   )
  // );
  return (
    <Box
      className={`player ${playerType}`}
      css={bind(player, "coverArt").as((p) =>
        playerType == "widget"
          ? `
                min-height:${rightPanelWidth.get()}px;
                background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                    url('${p}');
                `
          : ``
      )}>
      {img()}
      <Box vertical={true} hexpand={true} spacing={5}>
        <Box>
          {artist}
          {icon}
        </Box>
        <Box vexpand={true}></Box>
        {title}
        {positionSlider}
        <CenterBox>
          {positionLabel}
          <Box>
            {prev}
            {playPause}
            {next}
          </Box>
          {lengthLabel}
        </CenterBox>
      </Box>
    </Box>
  );
}
