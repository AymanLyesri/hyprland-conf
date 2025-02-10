import Brightness from "../../../services/brightness";
const brightness = Brightness.get_default();
// import { barLock, DND, rightPanelVisibility } from "../../../variables";
// import { closeProgress, openProgress } from "widgets/Progress";
import { custom_revealer } from "../../revealer";
import { bind, execAsync } from "../../../../../../../usr/share/astal/gjs";
import {
  Box,
  Label,
  Slider,
} from "../../../../../../../usr/share/astal/gjs/gtk3/widget";

import Wp from "gi://AstalWp";
const audio = Wp.get_default()!.audio;

import Battery from "gi://AstalBattery";
const battery = Battery.get_default();

import Tray from "gi://AstalTray";
import ToggleButton from "../../toggleButton";
import { Gtk } from "astal/gtk3";
import { barLock, DND } from "../../../variables";
const SystemTray = Tray.get_default();

function Theme() {
  function getIcon() {
    return execAsync([
      "bash",
      "-c",
      "$HOME/.config/hypr/theme/scripts/system-theme.sh get",
    ]).then((theme) => (theme.includes("dark") ? "" : ""));
  }

  // return Widget.ToggleButton({
  //     on_toggled: (self) =>
  //     {
  //         openProgress()
  //         Utils.execAsync(['bash', '-c', '$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch']).then(() => self.label = self.label == "" ? "" : "")
  //             .finally(() => closeProgress())
  //             .catch(err => Utils.notify(err))
  //     },

  //     label: "",
  //     class_name: "theme icon",
  //     setup: (self) => getIcon().then(icon => self.label = icon)
  // })

  const btnProps = {
    onToggled: (self: any) => {
      execAsync([
        "bash",
        "-c",
        "$HOME/.config/hypr/theme/scripts/system-theme.sh get",
      ])
        .then((theme) => {
          if (theme.includes("dark")) {
            self.label = "";
          } else {
            self.label = "";
          }
        })
        .catch((err) => print(err));
    },
    label: "",
    className: "theme icon",
  };

  return ToggleButton(btnProps);
}

function BrightnessWidget() {
  if (brightness.screen == 0) return <Box />;

  const slider = (
    <Slider
      widthRequest={100}
      className="slider"
      drawValue={false}
      onDragged={(self) => (brightness.screen = self.value)}
      value={bind(brightness, "screen")}
    />
  );

  const label = (
    <label
      className="icon"
      label={bind(brightness, "screen").as((v) => {
        `${Math.round(v * 100)}%`;
        switch (true) {
          case v > 0.75:
            return "󰃠";
          case v > 0.5:
            return "󰃟";
          case v > 0:
            return "󰃞";
          default:
            return "󰃞";
        }
      })}
    />
  );

  return custom_revealer(label, slider);
}

function Volume() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;
  const icon = <icon className="icon" icon={bind(speaker, "volumeIcon")} />;

  const slider = (
    <slider
      // hexpand
      className="slider"
      widthRequest={100}
      onDragged={({ value }) => (speaker.volume = value)}
      value={bind(speaker, "volume")}
    />
  );

  return custom_revealer(icon, slider, "", () =>
    execAsync(`pavucontrol`).catch((err) => print(err))
  );
}

function BatteryWidget() {
  const value = bind(battery, "percentage").as((p) => p);

  if (battery.percentage < 0) return <Box />;

  //   const label = Widget.Label({
  //     class_name: "icon",
  //     label: battery.bind("percent").as((p) => {
  //       switch (true) {
  //         case p == 100:
  //           return "";
  //         case p > 75:
  //           return "";
  //         case p > 50:
  //           return "";
  //         case p > 25:
  //           return "";
  //         case p > 10:
  //           return "";
  //         case p > 0:
  //           return "";
  //         default:
  //           return "";
  //       }
  //     }),
  //   });

  const label = (
    <label
      className="icon"
      label={bind(battery, "percentage").as((p) => {
        switch (true) {
          case p == 100:
            return "";
          case p > 75:
            return "";
          case p > 50:
            return "";
          case p > 25:
            return "";
          case p > 10:
            return "";
          case p > 0:
            return "";
          default:
            return "";
        }
      })}
    />
  );

  //   const info = Widget.Label({
  //     class_name: "icon",
  //     label: value.as((v) => `${v}%`),
  //   });

  const info = <Label className={"icon"} label={value.as((v) => `${v}%`)} />;

  // const slider = Widget.LevelBar({
  //   class_name: "",
  //   widthRequest: 100,
  //   min_value: 0,
  //   value: value.as((v) => v / 100),
  // });

  const slider = (
    <Slider
      className="slider"
      widthRequest={100}
      value={value.as((v) => v / 100)}
    />
  );

  // const box = Widget.Box({
  //   children: [info, slider],
  //   class_name: "battery",
  // });

  const box = (
    <Box className="battery">
      {info}
      {slider}
    </Box>
  );

  return custom_revealer(label, box);
}

function SysTray() {
  // const tray = Tray.get_default();
  // return (
  //   <box className="SysTray">
  //     {bind(tray, "items").as((items) =>
  //       items.map((item) => (
  //         <menubutton
  //           tooltipMarkup={bind(item, "tooltipMarkup")}
  //           usePopover={false}
  //           actionGroup={bind(item, "actionGroup").as((ag) => ["dbusmenu", ag])}
  //           menuModel={bind(item, "menuModel")}>
  //           <icon gicon={bind(item, "gicon")} />
  //         </menubutton>
  //       ))
  //     )}
  //   </box>
  // );
}

// function SysTray() {
//   const items = bind(SystemTray, "items").as((items) =>
//     items.map((item) => (
//       // Widget.Button({
//       //   child: Widget.Icon({ icon: item.bind("icon") }),
//       //   on_primary_click: (_, event) => item.activate(event),
//       //   on_secondary_click: (_, event) => item.openMenu(event),
//       //   on_middle_click: (_, event) => item.secondaryActivate(event),
//       //   tooltip_markup: item.bind("tooltip_markup"),
//       // })

//       <button
//         child={<icon icon={bind(item, "iconName")} />}
//         onPrimaryClick={(_, event) => item.activate(event, event)}
//         // onSecondaryClick={(_, event) => item.openMenu(event)}
//         // onMiddleClick={(_, event) => item.secondaryActivate(event)}
//         tooltipMarkup={bind(item, "tooltip_markup")}
//       />
//     ))
//   );

//   // return Widget.Box({
//   //   children: items,
//   //   class_name: "system-tray",
//   // });

//   return <Box className="system-tray">{items}</Box>;
// }

function PinBar() {
  // return Widget.ToggleButton({
  //   active: barLock.value,
  //   onToggled: (self) => {
  //     barLock.value = self.active;
  //     self.label = self.active ? "" : "";
  //   },
  //   class_name: "panel-lock icon",
  //   label: barLock.value ? "" : "",
  // });

  return (
    <ToggleButton
      state={barLock.get()}
      onToggled={(self, on) => {
        barLock.set(on);
        self.label = on ? "" : "";
      }}
      className="panel-lock icon"
      label={barLock.get() ? "" : ""}
    />
  );
}

function DndToggle() {
  // return Widget.ToggleButton({
  //   active: DND.value,
  //   on_toggled: ({ active }) => (DND.value = active),
  //   class_name: "dnd-toggle icon",
  // }).hook(
  //   DND,
  //   (self) => {
  //     self.active = DND.value;
  //     self.label = DND.value ? "" : "";
  //   },
  //   "changed"
  // );

  return (
    <ToggleButton
      state={DND.get()}
      onToggled={(self, on) => DND.set(on)}
      className="dnd-toggle icon"
    />
  );
}

export default () => {
  // return Widget.Box({
  //   class_name: "bar-right",
  //   hpack: "end",
  //   spacing: 5,
  //   children: [
  //     BatteryWidget(),
  //     Brightness(),
  //     Volume(),
  //     SysTray(),
  //     //   Theme(),
  //     PinBar(),
  //     DndToggle(),
  //   ],
  // });

  return (
    <Box className="bar-right" hexpand halign={Gtk.Align.END} spacing={5}>
      <BatteryWidget />
      <BrightnessWidget />
      <Volume />
      {/* <SysTray /> */}
      <Theme />
      <PinBar />
      <DndToggle />
    </Box>
  );
};
