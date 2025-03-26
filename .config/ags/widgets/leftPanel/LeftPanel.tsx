import { App, Astal, Gdk } from "astal/gtk3";
import { getMonitorName } from "../../utils/monitor";
import { bind, Variable } from "astal";
import {
  globalMargin,
  leftPanelExclusivity,
  leftPanelLock,
  leftPanelVisibility,
  leftPanelWidget,
  leftPanelWidth,
} from "../../variables";
import ChatBot from "./chatBot";
import { WindowActions } from "../../utils/window";
import ToggleButton from "../toggleButton";
import { WidgetSelector } from "../../interfaces/widgetSelector.interface";
import BooruViewer from "./BooruViewer";

const WidgetSelectors: WidgetSelector[] = [
  {
    name: "ChatBot",
    icon: "",
    widget: () => ChatBot(),
  },
  {
    name: "BooruViewer",
    icon: "",
    widget: () => BooruViewer(),
  },
];

const ProviderActions = () => (
  <box className={"provider-actions"} vertical={true} spacing={10}>
    {WidgetSelectors.map((widgetSelector) => (
      <ToggleButton
        state={bind(leftPanelWidget).as((w) => w.name === widgetSelector.name)}
        label={widgetSelector.icon}
        onToggled={() => leftPanelWidget.set(widgetSelector)}
      />
    ))}
  </box>
);

const Actions = () => (
  <box className={"panel-actions"} vertical={true}>
    <ProviderActions />
    <WindowActions
      windowWidth={leftPanelWidth}
      windowExclusivity={leftPanelExclusivity}
      windowLock={leftPanelLock}
      windowVisibility={leftPanelVisibility}
    />
  </box>
);

function Panel() {
  return (
    <box>
      <Actions />
      <box
        widthRequest={bind(leftPanelWidth)}
        child={bind(leftPanelWidget).as((widget) =>
          WidgetSelectors.find((ws) => ws.name === widget.name)?.widget()
        )}></box>
      <eventbox
        onHoverLost={() => {
          if (!leftPanelLock.get()) leftPanelVisibility.set(false);
        }}
        child={<box css={"min-width:5px"} />}></eventbox>
    </box>
  );
}

export default (monitor: Gdk.Monitor) => {
  return (
    <window
      gdkmonitor={monitor}
      name={`left-panel-${getMonitorName(monitor.get_display(), monitor)}`}
      namespace={"left-panel"}
      application={App}
      className={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? "left-panel exclusive" : "left-panel normal"
      )}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      exclusivity={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Exclusivity.EXCLUSIVE : Astal.Exclusivity.NORMAL
      )}
      layer={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Layer.BOTTOM : Astal.Layer.TOP
      )}
      margin={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? 0 : globalMargin
      )}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={bind(leftPanelVisibility)}
      child={<Panel />}
    />
  );
};
