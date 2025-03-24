import { Astal, Gdk } from "astal/gtk3";
import { leftPanelLock, leftPanelVisibility } from "../../variables";

export default (monitor: Gdk.Monitor) => {
  return (
    <window
      gdkmonitor={monitor}
      className="LeftPanel"
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      child={
        <eventbox
          onHover={() => {
            if (!leftPanelLock.get()) leftPanelVisibility.set(true);
          }}
          child={<box css="min-width: 1px" />}></eventbox>
      }></window>
  );
};
