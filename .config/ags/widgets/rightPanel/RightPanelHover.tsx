import { Astal, Gdk } from "astal/gtk3";
import { rightPanelLock, rightPanelVisibility } from "../../variables";

export default (monitor: Gdk.Monitor) => {
  return (
    <window
      gdkmonitor={monitor}
      className="RightPanel"
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      child={
        <eventbox
          onHover={() => {
            if (!rightPanelLock.get()) rightPanelVisibility.set(true);
          }}
          child={<box css="min-width: 1px" />}></eventbox>
      }></window>
  );
};
