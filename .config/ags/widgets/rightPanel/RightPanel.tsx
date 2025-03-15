import { App, Astal, Gtk } from "astal/gtk3";
import { WidgetSelector } from "../../interfaces/widgetSelector.interface";
import waifu, { WaifuVisibility } from "./components/waifu";
import {
  globalMargin,
  globalOpacity,
  rightPanelExclusivity,
  rightPanelLock,
  rightPanelVisibility,
  rightPanelWidth,
  widgetLimit,
  Widgets,
} from "../../variables";
import { bind } from "astal";
import CustomRevealer from "../CustomRevealer";
import ToggleButton from "../toggleButton";
import { exportSettings, setSetting } from "../../utils/settings";
import MediaWidget from "../MediaWidget";
import NotificationHistory from "./NotificationHistory";
import Calendar from "../Calendar";

// Name need to match the name of the widget()
export const WidgetSelectors: WidgetSelector[] = [
  {
    name: "Waifu",
    icon: "",
    widget: () => waifu(),
  },
  {
    name: "Media",
    icon: "",
    widget: () => MediaWidget(),
  },
  {
    name: "NotificationHistory",
    icon: "",
    widget: () => NotificationHistory(),
  },
  {
    name: "Calendar",
    icon: "",
    widget: () => Calendar(),
  },
  // {
  //   name: "Resources",
  //   icon: "",
  //   widget: () => Resources(),
  // },
  // {
  //   name: "Update",
  //   icon: "󰚰",
  //   widget: () => Update(),
  // },
];

const maxRightPanelWidth = 600;
const minRightPanelWidth = 200;

const opacitySlider = () => {
  const label = (
    <label
      className={"icon"}
      label={"󱡓"}
      css={`
        min-width: 0px;
      `}
    />
  );

  const slider = (
    <slider
      hexpand={false}
      vexpand={true}
      vertical={true}
      inverted={true}
      halign={Gtk.Align.CENTER}
      height_request={100}
      draw_value={false}
      className={"slider"}
      value={globalOpacity.get()}
      onValueChanged={({ value }) => {
        globalOpacity.set(value);
      }}
    />
  );

  return CustomRevealer(label, slider, "", () => {}, true);
};

const WidgetActions = () => {
  return (
    <box vertical={true} vexpand={true} className={"widget-actions"}>
      {WidgetSelectors.map((selector) => {
        return (
          <ToggleButton
            className={"widget-selector"}
            label={selector.icon}
            state={
              Widgets.get().find((w) => w.name == selector.name) ? true : false
            }
            onToggled={(self, on) => {
              if (on) {
                if (Widgets.get().length >= widgetLimit) {
                  return;
                }
                if (!selector.widgetInstance) {
                  selector.widgetInstance = selector.widget();
                }
                if (!Widgets.get().includes(selector)) {
                  Widgets.set([...Widgets.get(), selector]);
                }
              } else {
                let newWidgets = Widgets.get().filter((w) => w != selector);
                if (Widgets.get().length == newWidgets.length) return;
                Widgets.set(newWidgets);
                selector.widgetInstance = undefined;
              }
            }}
          />
        );
      })}
    </box>
  );
};

const kelvinMin = 1000;
const kelvinMax = 10000;

const Utilities = () => (
  // Widget.Box({
  //   vertical: true,
  //   spacing: 5,
  //   vexpand: true,
  //   vpack: "center",
  //   children: [
  //     Widget.Button({
  //       label: "󱁝",
  //       class_name: "",
  //       on_clicked: () => {
  //         const kelvin = Math.min(
  //           kelvinMax,
  //           Math.max(kelvinMin, globalSettings.get().hyprsunset.kelvin + 1000)
  //         );
  //         Utils.execAsync(
  //           `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
  //         ).catch((err) => {
  //           Utils.notify("Failed to change kelvin", err);
  //           return;
  //         });
  //         setSetting("hyprsunset.kelvin", kelvin);
  //       },
  //     }),
  //     Widget.Button({
  //       label: "󱁞",
  //       class_name: "",
  //       on_clicked: () => {
  //         const kelvin = Math.min(
  //           kelvinMax,
  //           Math.max(kelvinMin, globalSettings.get().hyprsunset.kelvin - 1000)
  //         );
  //         Utils.execAsync(
  //           `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
  //         ).catch((err) => {
  //           Utils.notify("Failed to change kelvin", err);
  //           return;
  //         });
  //         setSetting("hyprsunset.kelvin", kelvin);
  //       },
  //     }),
  //   ],
  // });
  <box vertical={true} spacing={5} vexpand={true} valign={Gtk.Align.CENTER}>
    {/* <button
      label={"󱁝"}
      className={""}
      onClicked={() => {
        const kelvin = Math.min(
          kelvinMax,
          Math.max(kelvinMin, globalSettings.get().hyprsunset.kelvin + 1000)
        );
        Utils.execAsync(
          `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
        ).catch((err) => {
          Utils.notify("Failed to change kelvin", err);
          return;
        });
        setSetting("hyprsunset.kelvin", kelvin);
      }}
    />
    <button
      label={"󱁞"}
      className={""}
      onClicked={() => {
        const kelvin = Math.min(
          kelvinMax,
          Math.max(kelvinMin, globalSettings.get().hyprsunset.kelvin - 1000)
        );
        Utils.execAsync(
          `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
        ).catch((err) => {
          Utils.notify("Failed to change kelvin", err);
          return;
        });
        setSetting("hyprsunset.kelvin", kelvin);
      }}
    /> */}
  </box>
);

function WindowActions() {
  return (
    <box
      className={"window-actions"}
      vexpand={true}
      halign={Gtk.Align.END}
      valign={Gtk.Align.END}
      vertical={true}>
      {opacitySlider()}
      <button
        label={"󰈇"}
        className={"export-settings"}
        onClicked={() => exportSettings()}
      />
      <button
        label={""}
        className={"expand-window"}
        onClicked={() => {
          rightPanelWidth.set(
            rightPanelWidth.get() < maxRightPanelWidth
              ? rightPanelWidth.get() + 50
              : maxRightPanelWidth
          );
        }}
      />
      <button
        label={""}
        className={"shrink-window"}
        onClicked={() => {
          rightPanelWidth.set(
            rightPanelWidth.get() > minRightPanelWidth
              ? rightPanelWidth.get() - 50
              : minRightPanelWidth
          );
        }}
      />
      <ToggleButton
        label={""}
        className={"exclusivity"}
        state={rightPanelExclusivity.get()}
        onToggled={(self, on) => {
          rightPanelExclusivity.set(on);
        }}
      />
      <ToggleButton
        label={rightPanelLock.get() ? "" : ""}
        className={"lock"}
        state={rightPanelLock.get()}
        onToggled={(self, on) => {
          rightPanelLock.set(on);
          self.label = on ? "" : "";
        }}
      />
      <button
        label={""}
        className={"close"}
        onClicked={() => {
          rightPanelVisibility.set(false);
        }}
      />
    </box>
  );
}

const Actions = () => (
  <box className={"right-panel-actions"} vertical={true}>
    <WidgetActions />
    <Utilities />
    <WindowActions />
  </box>
);

function Panel() {
  return (
    <box
      css={`
        // padding-left: 5px;
      `}>
      <eventbox
        onHoverLost={() => {
          if (!rightPanelLock.get()) rightPanelVisibility.set(false);
        }}
        child={<box css={"min-width:5px"} />}></eventbox>
      <box
        className={"main-content"}
        css={bind(rightPanelWidth).as((width) => `*{min-width: ${width}px}`)}
        vertical={true}
        spacing={10}>
        {bind(Widgets).as((widgets) => {
          return widgets.map((widget) => widget.widget());
        })}
      </box>
      <Actions />
    </box>
  );
}

const Window = () => {
  return (
    <window
      name={`right-panel`}
      namespace={"right-panel"}
      application={App}
      className={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? "right-panel exclusive" : "right-panel normal"
      )}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      exclusivity={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Exclusivity.EXCLUSIVE : Astal.Exclusivity.NORMAL
      )}
      layer={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Layer.BOTTOM : Astal.Layer.TOP
      )}
      margin={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? 0 : globalMargin
      )}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={bind(rightPanelVisibility)}
      child={<Panel />}
    />
  );
};

export default () => {
  return Window();
};
