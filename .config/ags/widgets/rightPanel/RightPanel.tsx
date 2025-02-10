import { Astal, Gtk } from "astal/gtk3";
import { WidgetSelector } from "../../interfaces/widgetSelector.interface";
import waifu, { WaifuVisibility } from "./components/waifu";
import {
  globalOpacity,
  rightPanelLock,
  rightPanelVisibility,
  rightPanelWidth,
} from "../../variables";
import { bind } from "astal";
import CustomRevealer from "../CustomRevealer";
import ToggleButton from "../toggleButton";

// Name need to match the name of the widget()
export const WidgetSelectors: WidgetSelector[] = [
  //     {
  //     name: "Waifu",
  //     icon: "",
  //     widget: () => waifu()
  // }, {
  //     name: "Media",
  //     icon: "",
  //     widget: () => MediaWidget()
  // }, {
  //     name: "NotificationHistory",
  //     icon: "",
  //     widget: () => NotificationHistory()
  // }, {
  //     name: "Calendar",
  //     icon: "",
  //     widget: () => Calendar()
  // }, {
  //     name: "Resources",
  //     icon: "",
  //     widget: () => Resources()
  // }, {
  //     name: "Update",
  //     icon: "󰚰",
  //     widget: () => Update()
  //     }
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
      css={`
        min-width: 0px;
      `}>
      󱡓
    </label>
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
  //     on_change: ({ value }) => (globalOpacity.value = value),
  //   });

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
      value={bind(globalOpacity)}
      onChange={({ value }) => globalOpacity.set(value)}
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
//         active: Widgets.value.find((w) => w.name == selector.name)
//           ? true
//           : false,
//         on_toggled: (self) => {
//           // If the button is active, create and store a new widget instance
//           if (self.active) {
//             // Limit the number of widgets to 3
//             if (Widgets.value.length >= widgetLimit) {
//               self.active = false;
//               return;
//             }
//             // Create widget only if it's not already created
//             if (!selector.widgetInstance) {
//               selector.widgetInstance = selector.widget();
//             }
//             // Add the widget instance to Widgets if it's not already added
//             if (!Widgets.value.includes(selector)) {
//               Widgets.value = [...Widgets.value, selector];
//             }
//           }
//           // If the button is deactivated, remove the widget from the array
//           else {
//             let newWidgets = Widgets.value.filter((w) => w != selector); // Remove it from the array
//             if (Widgets.value.length == newWidgets.length) return;

//             Widgets.value = newWidgets;
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
        return (
          <ToggleButton
            className={"selector"}
            label={selector.icon}
            // state={
            //   Widgets.value.find((w) => w.name == selector.name) ? true : false
            // }
            // onToggled={(self) => {
            //   if (self.active) {
            //     if (Widgets.value.length >= widgetLimit) {
            //       self.active = false;
            //       return;
            //     }
            //     if (!selector.widgetInstance) {
            //       selector.widgetInstance = selector.widget();
            //     }
            //     if (!Widgets.value.includes(selector)) {
            //       Widgets.value = [...Widgets.value, selector];
            //     }
            //   } else {
            //     let newWidgets = Widgets.value.filter((w) => w != selector);
            //     if (Widgets.value.length == newWidgets.length) return;
            //     Widgets.value = newWidgets;
            //     selector.widgetInstance = undefined;
            //   }
            // }}
          />
        );
      })}
    </box>
  );
};

const kelvinMin = 1000;
const kelvinMax = 10000;

// const Utilities = () =>
//   Widget.Box({
//     vertical: true,
//     spacing: 5,
//     vexpand: true,
//     vpack: "center",
//     children: [
//       Widget.Button({
//         label: "󱁝",
//         class_name: "",
//         on_clicked: () => {
//           const kelvin = Math.min(
//             kelvinMax,
//             Math.max(kelvinMin, globalSettings.value.hyprsunset.kelvin + 1000)
//           );
//           Utils.execAsync(
//             `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
//           ).catch((err) => {
//             Utils.notify("Failed to change kelvin", err);
//             return;
//           });
//           setSetting("hyprsunset.kelvin", kelvin);
//         },
//       }),
//       Widget.Button({
//         label: "󱁞",
//         class_name: "",
//         on_clicked: () => {
//           const kelvin = Math.min(
//             kelvinMax,
//             Math.max(kelvinMin, globalSettings.value.hyprsunset.kelvin - 1000)
//           );
//           Utils.execAsync(
//             `bash -c 'killall hyprsunset; hyprsunset -t ${kelvin}'`
//           ).catch((err) => {
//             Utils.notify("Failed to change kelvin", err);
//             return;
//           });
//           setSetting("hyprsunset.kelvin", kelvin);
//         },
//       }),
//     ],
//   });

// function WindowActions() {
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
//         (rightPanelWidth.value =
//           rightPanelWidth.value < maxRightPanelWidth
//             ? rightPanelWidth.value + 50
//             : maxRightPanelWidth),
//     }),
//     Widget.Button({
//       label: "",
//       class_name: "shrink-window",
//       on_clicked: () =>
//         (rightPanelWidth.value =
//           rightPanelWidth.value > minRightPanelWidth
//             ? rightPanelWidth.value - 50
//             : minRightPanelWidth),
//     }),
//     WaifuVisibility(),
//     Widget.ToggleButton({
//       label: "",
//       class_name: "exclusivity",
//       onToggled: ({ active }) => {
//         rightPanelExclusivity.value = active;
//       },
//     }).hook(
//       rightPanelExclusivity,
//       (self) => (self.active = rightPanelExclusivity.value),
//       "changed"
//     ),
//     Widget.ToggleButton({
//       label: rightPanelLock.value ? "" : "",
//       class_name: "lock",
//       active: rightPanelLock.value,
//       onToggled: (self) => {
//         rightPanelLock.value = self.active;
//         self.label = self.active ? "" : "";
//       },
//     }),
//     Widget.Button({
//       label: "",
//       class_name: "close",
//       on_clicked: () => (rightPanelVisibility.value = false),
//     })
//   );
// }

// const Actions = () =>
//   Widget.Box({
//     class_name: "right-panel-actions",
//     vertical: true,
//     children: [WidgetActions(), Utilities(), WindowActions()],
//   });

function Panel() {
  //   return Widget.Box({
  //     css: `padding-left: 5px;`,
  //     child: Widget.EventBox({
  //       on_hover_lost: () => {
  //         if (!rightPanelLock.value) rightPanelVisibility.value = false;
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
      <eventbox
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
            {/* {Widgets.bind().as((widgets) =>
              widgets.map((widget) => widget.widget())
            )} */}
          </box>
          {/* <Actions /> */}
        </box>
      </eventbox>
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
//     visible: rightPanelVisibility.value,
//     child: Panel(),
//   })
//     .hook(
//       rightPanelExclusivity,
//       (self) => {
//         self.exclusivity = rightPanelExclusivity.value ? "exclusive" : "normal";
//         self.layer = rightPanelExclusivity.value ? "bottom" : "top";
//         self.class_name = rightPanelExclusivity.value
//           ? "right-panel exclusive"
//           : "right-panel normal";
//         self.margins = rightPanelExclusivity.value
//           ? [0, 0]
//           : [5, globalMargin, globalMargin, globalMargin];
//       },
//       "changed"
//     )
//     .hook(
//       rightPanelVisibility,
//       (self) => (self.visible = rightPanelVisibility.value),
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
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={rightPanelVisibility.get()}>
      <Panel />
    </window>
  );
};

export default () => {
  return Window();
};
