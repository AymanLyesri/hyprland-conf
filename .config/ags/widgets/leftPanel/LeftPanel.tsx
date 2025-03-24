import { App, Astal, Gdk } from "astal/gtk3";
import { getMonitorName } from "../../utils/monitor";
import { bind, Variable } from "astal";
import {
  globalMargin,
  leftPanelExclusivity,
  leftPanelLock,
  leftPanelVisibility,
  leftPanelWidth,
} from "../../variables";
import ChatBot from "./chatBot";
import { WindowActions } from "../../utils/window";
import { Provider } from "../../interfaces/chatbot.interface";
import ToggleButton from "../toggleButton";
import { getSetting, setSetting } from "../../utils/settings";

const provider = Variable<Provider>(getSetting("chatBot.provider"));
provider.subscribe((value) => setSetting("chatBot.provider", value));

const providers: Provider[] = [
  {
    name: "pollinations",
    icon: "Po",
    description: "Completely free, default model is gpt-4o",
    imageGenerationSupport: true,
  },
  {
    name: "phind",
    icon: "Ph",
    description: "Uses Phind Model. Great for developers",
  },
];

const ProviderActions = () => (
  <box className={"provider-actions"} vertical={true}>
    {providers.map((p) => (
      <ToggleButton
        state={bind(provider).as((provider) => provider.name === p.name)}
        label={p.icon}
        onToggled={() => provider.set(p)}
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
      <box>
        <Actions />
        <ChatBot provider={provider} />
      </box>

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
      widthRequest={bind(leftPanelWidth)}
      child={<Panel />}
    />
  );
};
