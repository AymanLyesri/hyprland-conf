import { App, Astal, Gdk, Gtk } from "astal/gtk3";
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
import { bind, Variable } from "astal";
import CustomRevealer from "../CustomRevealer";
import ToggleButton from "../toggleButton";
import { exportSettings, setSetting } from "../../utils/settings";
import MediaWidget from "../MediaWidget";
import NotificationHistory from "./NotificationHistory";
import Calendar from "../Calendar";
import { getMonitorName } from "../../utils/monitor";
import { WindowActions } from "../../utils/window";

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

const WidgetActions = () => {
  return (
    <box vertical={true} vexpand={true} className={"widget-actions"}>
      {WidgetSelectors.map((selector) => {
        const isActive = Widgets.get().some((w) => w.name === selector.name);
        return (
          <ToggleButton
            className={"widget-selector"}
            label={selector.icon}
            state={isActive}
            onToggled={(self, on) => {
              if (on) {
                if (Widgets.get().length >= widgetLimit) return;
                if (!selector.widgetInstance) {
                  selector.widgetInstance = selector.widget();
                }
                Widgets.set([...Widgets.get(), selector]);
              } else {
                const newWidgets = Widgets.get().filter((w) => w !== selector);
                Widgets.set(newWidgets);
              }
            }}
          />
        );
      })}
    </box>
  );
};

const Actions = () => (
  <box className={"panel-actions"} vertical={true}>
    <WidgetActions />
    <WindowActions
      windowWidth={rightPanelWidth}
      windowExclusivity={rightPanelExclusivity}
      windowLock={rightPanelLock}
      windowVisibility={rightPanelVisibility}
    />
  </box>
);

function Panel() {
  return (
    <box>
      <eventbox
        onHoverLost={() => {
          if (!rightPanelLock.get()) rightPanelVisibility.set(false);
        }}
        child={<box css={"min-width:5px"} />}></eventbox>
      <box
        className={"main-content"}
        vertical={true}
        spacing={10}
        widthRequest={bind(rightPanelWidth)}>
        {bind(Widgets).as((widgets) => {
          return widgets
            .filter((widget) => widget && widget.widget) // Filter out undefined widgets and those without a widget method
            .map((widget) => {
              try {
                return widget.widget();
              } catch (error) {
                console.error(`Error rendering widget ${widget.name}:`, error);
                return <box />; // Return null or a fallback component in case of error
              }
            });
        })}
      </box>
      <Actions />
    </box>
  );
}
export default (monitor: Gdk.Monitor) => {
  return (
    <window
      gdkmonitor={monitor}
      name={`right-panel-${getMonitorName(monitor.get_display(), monitor)}`}
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
