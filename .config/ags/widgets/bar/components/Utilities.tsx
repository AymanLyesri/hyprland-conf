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
import { barLock, barOrientation, DND, globalTheme } from "../../../variables";
import { notify } from "../../../utils/notification";
import { switchGlobalTheme } from "../../../utils/theme";

function Theme() {
  return (
    <ToggleButton
      onToggled={(self, on) => switchGlobalTheme()}
      label={bind(globalTheme).as((theme) => (theme ? "" : ""))}
      className="theme icon"
    />
  );
}

function BrightnessWidget() {
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
      className="trigger"
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

  return (
    <CustomRevealer
      trigger={label}
      child={slider}
      visible={brightness.screen != 0}
    />
  );
}

function Volume() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!;
  const icon = <icon className="trigger" icon={bind(speaker, "volumeIcon")} />;

  const slider = (
    <slider
      step={0.1}
      className="slider"
      widthRequest={100}
      onDragged={({ value }) => (speaker.volume = value)}
      value={bind(speaker, "volume")}
    />
  );

  return (
    <CustomRevealer
      trigger={icon}
      child={slider}
      on_primary_click={() => {
        execAsync(`pavucontrol`).catch((err) =>
          notify({ summary: "pavu", body: err })
        );
      }}
    />
  );
}

function BatteryWidget() {
  const value = bind(battery, "percentage").as((p) => p);

  // if (battery.percentage <= 0) return <box />;

  const label = (
    <label
      className="trigger"
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
    <label className={"trigger"} label={value.as((v) => `${v * 100}%`)} />
  );

  const slider = (
    <levelbar
      className="slider"
      widthRequest={100}
      value={value.as((v) => v)}
    />
  );

  const box = (
    <box>
      {info}
      {slider}
    </box>
  );

  return (
    <CustomRevealer
      trigger={label}
      child={box}
      visible={battery.percentage > 0}
    />
  );
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

export default ({
  monitorName,
  halign,
}: {
  monitorName: string;
  halign: Gtk.Align;
}) => {
  return (
    <box className="bar-right" spacing={5} halign={halign} hexpand>
      <BatteryWidget />
      <BrightnessWidget />
      <Volume />
      <SysTray />
      <Theme />
      <PinBar />
      <DndToggle />
      <BarOrientation />
    </box>
  );
};
