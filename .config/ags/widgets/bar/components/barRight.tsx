import Brightness from "../../../services/brightness";
const brightness = Brightness.get_default();
import CustomRevealer from "../../CustomRevealer";
import { bind, execAsync } from "../../../../../../../usr/share/astal/gjs";

import Wp from "gi://AstalWp";

import Battery from "gi://AstalBattery";
const battery = Battery.get_default();

import Tray from "gi://AstalTray";
import ToggleButton from "../../toggleButton";
import { Gtk } from "astal/gtk3";
import {
  barLock,
  barOrientation,
  DND,
  globalTransition,
  rightPanelLock,
  rightPanelVisibility,
} from "../../../variables";

function Theme() {
  function getIcon() {
    return execAsync([
      "bash",
      "-c",
      "$HOME/.config/hypr/theme/scripts/system-theme.sh get",
    ]).then((theme) => (theme.includes("dark") ? "" : ""));
  }
  return (
    <ToggleButton
      onToggled={(self, on) => {
        execAsync([
          "bash",
          "-c",
          "$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch",
        ]).then(() => getIcon().then((icon) => (self.label = icon)));
      }}
      label=""
      className="theme icon"
      setup={(self) => getIcon().then((icon) => (self.label = icon))}
    />
  );
}

function BrightnessWidget() {
  if (brightness.screen == 0) return <box />;

  const slider = (
    <slider
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

  return CustomRevealer(label, slider);
}

function Volume() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;
  const icon = <icon className="icon" icon={bind(speaker, "volumeIcon")} />;

  const slider = (
    <slider
      step={0.1}
      className="slider"
      widthRequest={100}
      onValueChanged={({ value }) => (speaker.volume = value)}
      value={bind(speaker, "volume")}
    />
  );

  return CustomRevealer(icon, slider, "", () =>
    execAsync(`pavucontrol`).catch((err) => print(err))
  );
}

function BatteryWidget() {
  const value = bind(battery, "percentage").as((p) => p);

  if (battery.percentage <= 0) return <box />;

  const label = (
    <label
      className="icon"
      label={bind(battery, "percentage").as((p) => {
        p *= 100;
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

  const info = (
    <label className={"icon"} label={value.as((v) => `${v * 100}%`)} />
  );

  const slider = (
    <levelbar
      className="slider"
      canDrag={false}
      widthRequest={100}
      value={value.as((v) => v)}
    />
  );

  const box = (
    <box className="battery">
      {info}
      {slider}
    </box>
  );

  return CustomRevealer(label, box);
}

function SysTray() {
  const tray = Tray.get_default();

  const items = bind(tray, "items").as((items) =>
    items.map((item) => (
      <menubutton
        margin={0}
        cursor="pointer"
        usePopover={false}
        tooltipMarkup={bind(item, "tooltipMarkup")}
        actionGroup={bind(item, "actionGroup").as((ag) => ["dbusmenu", ag])}
        menuModel={bind(item, "menuModel")}
        child={<icon gicon={bind(item, "gicon")} className="systemtray-icon" />}
      />
    ))
  );

  return <box className="system-tray">{items}</box>;
}

function PinBar() {
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
  return ToggleButton({
    state: DND.get(),
    onToggled: (self, on) => {
      DND.set(on);
      self.label = DND.get() ? "" : "";
    },
    className: "dnd-toggle icon",
    label: DND.get() ? "" : "",
  });
}

function RightPanel() {
  return (
    <revealer
      revealChild={bind(rightPanelLock).as((lock) => lock)}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={globalTransition}
      child={
        <ToggleButton
          state={bind(rightPanelVisibility)}
          label={bind(rightPanelVisibility).as((v) => (v ? "" : ""))}
          onToggled={(self, on) => rightPanelVisibility.set(on)}
          className="panel-trigger icon"
        />
      }
    />
  );
}

function BarOrientation() {
  return (
    <button
      onClicked={() => barOrientation.set(!barOrientation.get())}
      className="bar-orientation icon"
      label={bind(barOrientation).as((orientation) =>
        orientation ? "" : ""
      )}
    />
  );
}

export default () => {
  return (
    <box className="bar-right" hexpand halign={Gtk.Align.END} spacing={5}>
      <BatteryWidget />
      <BrightnessWidget />
      <Volume />
      <SysTray />
      <Theme />
      <PinBar />
      <DndToggle />
      <BarOrientation />
      <RightPanel />
    </box>
  );
};
