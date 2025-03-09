import { Astal, Gtk } from "astal/gtk3";
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
import { EventBox, Slider } from "astal/gtk3/widget";
import MediaWidget from "../MediaWidget";
import NotificationHistory from "./NotificationHistory";

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
  // {
  //   name: "Calendar",
  //   icon: "",
  //   widget: () => Calendar(),
  // },
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
  //   const label = Widget.Label({
  //     class_name: "icon",
  //     css: `min-width: 0px;`,
  //     label: "󱡓",
  //   });

  const label = (
    <label
      className={"icon"}
      label={"󱡓"}
      css={`
        min-width: 0px;
      `}
    />
  );

  //   const slider = Widget.Slider({
  //     hexpand: false,
  //     vexpand: true,
  //     vertical: true,
  //     inverted: true,
  //     hpack: "center",
  //     height_request: 100,
  //     draw_value: false,
  //     class_name: "slider",
  //     value: globalOpacity.bind(),
  //     on_change: ({ value }) => (globalOpacity.get() = value),
  //   });

  const slider = (
    <Slider
      hexpand={false}
      vexpand={true}
      vertical={true}
      inverted={true}
      halign={Gtk.Align.CENTER}
      height_request={100}
      draw_value={false}
      className={"slider"}
      value={globalOpacity.get()}
      onDragged={({ value }) => {
        globalOpacity.set(value);
      }}
    />
  );

  return CustomRevealer(label, slider, "", () => {}, true);
};

// const WidgetActions = () =>
//   Widget.Box({
//     vertical: true,
//     vexpand: true,
//     spacing: 5,
//     children: WidgetSelectors.map((selector) =>
//       Widget.ToggleButton({
//         class_name: "selector",
//         label: selector.icon,
//         active: Widgets.get().find((w) => w.name == selector.name)
//           ? true
//           : false,
//         on_toggled: (self) => {
//           // If the button is active, create and store a new widget instance
//           if (self.active) {
//             // Limit the number of widgets to 3
//             if (Widgets.get().length >= widgetLimit) {
//               self.active = false;
//               return;
//             }
//             // Create widget only if it's not already created
//             if (!selector.widgetInstance) {
//               selector.widgetInstance = selector.widget();
//             }
//             // Add the widget instance to Widgets if it's not already added
//             if (!Widgets.get().includes(selector)) {
//               Widgets.get() = [...Widgets.get(), selector];
//             }
//           }
//           // If the button is deactivated, remove the widget from the array
//           else {
//             let newWidgets = Widgets.get().filter((w) => w != selector); // Remove it from the array
//             if (Widgets.get().length == newWidgets.length) return;

//             Widgets.get() = newWidgets;
//             selector.widgetInstance = undefined; // Reset the widget instance
//           }
//         },
//       })
//     ),
//   });

const WidgetActions = () => {
  return (
    <box vertical={true} vexpand={true} spacing={5}>
      {WidgetSelectors.map((selector) => {
        // return ToggleButton({
        //   className: "selector",
        //   label: selector.icon,
        //   state: false,
        //   onToggled: (self, on) => {
        //     if (on) {
        //       print("self is ", self);
        //       if (Widgets.get().length >= widgetLimit) {
        //         // self.state = false;
        //         return;
        //       }
        //       // Create widget only if it's not already created
        //       if (!selector.widgetInstance) {
        //         selector.widgetInstance = selector.widget();
        //       }
        //       // Add the widget instance to Widgets if it's not already added
        //       if (!Widgets.get().includes(selector)) {
        //         Widgets.set([...Widgets.get(), selector]);
        //       }
        //     } else {
        //       let newWidgets = Widgets.get().filter((w) => w != selector); // Remove it from the array
        //       if (Widgets.get().length == newWidgets.length) return;
        //       Widgets.set(newWidgets);
        //       selector.widgetInstance = undefined;
        //     }
        //   },
        // });
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
  //   return Widget.Box(
  //     {
  //       vexpand: true,
  //       hpack: "end",
  //       vpack: "end",
  //       vertical: true,
  //       spacing: 5,
  //     },
  //     opacitySlider(),

  //     Widget.Button({
  //       label: "󰈇",
  //       class_name: "export-settings",
  //       on_clicked: () => exportSettings(),
  //     }),
  //     Widget.Button({
  //       label: "",
  //       class_name: "expand-window",
  //       on_clicked: () =>
  //         (rightPanelWidth.get() =
  //           rightPanelWidth.get() < maxRightPanelWidth
  //             ? rightPanelWidth.get() + 50
  //             : maxRightPanelWidth),
  //     }),
  //     Widget.Button({
  //       label: "",
  //       class_name: "shrink-window",
  //       on_clicked: () =>
  //         (rightPanelWidth.get() =
  //           rightPanelWidth.get() > minRightPanelWidth
  //             ? rightPanelWidth.get() - 50
  //             : minRightPanelWidth),
  //     }),
  //     WaifuVisibility(),
  //     Widget.ToggleButton({
  //       label: "",
  //       class_name: "exclusivity",
  //       onToggled: ({ active }) => {
  //         rightPanelExclusivity.get() = active;
  //       },
  //     }).hook(
  //       rightPanelExclusivity,
  //       (self) => (self.active = rightPanelExclusivity.get()),
  //       "changed"
  //     ),
  //     Widget.ToggleButton({
  //       label: rightPanelLock.get() ? "" : "",
  //       class_name: "lock",
  //       active: rightPanelLock.get(),
  //       onToggled: (self) => {
  //         rightPanelLock.get() = self.active;
  //         self.label = self.active ? "" : "";
  //       },
  //     }),
  //     Widget.Button({
  //       label: "",
  //       class_name: "close",
  //       on_clicked: () => (rightPanelVisibility.get() = false),
  //     })
  //   );
  return (
    <box
      vexpand={true}
      halign={Gtk.Align.END}
      valign={Gtk.Align.END}
      vertical={true}
      spacing={5}>
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
  // Widget.Box({
  //   class_name: "right-panel-actions",
  //   vertical: true,
  //   children: [WidgetActions(), Utilities(), WindowActions()],
  // });
  <box className={"right-panel-actions"} vertical={true}>
    <WidgetActions />
    <Utilities />
    <WindowActions />
  </box>
);

function Panel() {
  //   return Widget.Box({
  //     css: `padding-left: 5px;`,
  //     child: Widget.EventBox({
  //       on_hover_lost: () => {
  //         if (!rightPanelLock.get()) rightPanelVisibility.get() = false;
  //       },
  //       child: Widget.Box({
  //         children: [
  //           Widget.Box({
  //             class_name: "main-content",
  //             css: rightPanelWidth
  //               .bind()
  //               .as((width) => `*{min-width: ${width}px}`),
  //             vertical: true,
  //             spacing: 5,
  //             children: Widgets.bind().as((widgets) =>
  //               widgets.map((widget) => widget.widget())
  //             ),
  //           }),
  //           Actions(),
  //         ],
  //       }),
  //     }),
  //   });
  return (
    <box
      css={`
        padding-left: 5px;
      `}>
      <EventBox
        onHoverLost={() => {
          if (!rightPanelLock.get()) rightPanelVisibility.set(false);
        }}>
        <box>
          <box
            className={"main-content"}
            css={bind(rightPanelWidth).as(
              (width) => `*{min-width: ${width}px}`
            )}
            vertical={true}
            spacing={5}>
            {bind(Widgets).as((widgets) => {
              print("widgets are ", widgets.length);
              return widgets.map((widget) => widget.widget());
            })}
          </box>
          <Actions />
        </box>
      </EventBox>
    </box>
  );
}

// const Window = () =>
//   Widget.Window({
//     name: `right-panel`,
//     class_name: "right-panel",
//     anchor: ["right", "top", "bottom"],
//     exclusivity: "normal",
//     layer: "overlay",
//     keymode: "on-demand",
//     visible: rightPanelVisibility.get(),
//     child: Panel(),
//   })
//     .hook(
//       rightPanelExclusivity,
//       (self) => {
//         self.exclusivity = rightPanelExclusivity.get() ? "exclusive" : "normal";
//         self.layer = rightPanelExclusivity.get() ? "bottom" : "top";
//         self.class_name = rightPanelExclusivity.get()
//           ? "right-panel exclusive"
//           : "right-panel normal";
//         self.margins = rightPanelExclusivity.get()
//           ? [0, 0]
//           : [5, globalMargin, globalMargin, globalMargin];
//       },
//       "changed"
//     )
//     .hook(
//       rightPanelVisibility,
//       (self) => (self.visible = rightPanelVisibility.get()),
//       "changed"
//     );

const Window = () => {
  return (
    <window
      name={`right-panel`}
      className={"right-panel"}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={rightPanelVisibility.get()}
      setup={(self) => {
        self.hook(rightPanelExclusivity, (self) => {
          self.exclusivity = rightPanelExclusivity.get()
            ? Astal.Exclusivity.EXCLUSIVE
            : Astal.Exclusivity.NORMAL;
          self.layer = rightPanelExclusivity.get()
            ? Astal.Layer.BOTTOM
            : Astal.Layer.TOP;
          self.className = rightPanelExclusivity.get()
            ? "right-panel exclusive"
            : "right-panel normal";
          // self.margins = rightPanelExclusivity.get()
          //   ? [0, 0]
          //   : [5, globalMargin.get(), globalMargin.get(), globalMargin.get()];
        });
        self.hook(
          rightPanelVisibility,
          (self) => (self.visible = rightPanelVisibility.get())
        );
      }}>
      <Panel />
    </window>
  );
};

export default () => {
  return Window();
};
