import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { bind } from "astal";
import Workspaces from "./components/Workspaces";
import Information from "./components/Information";
import Utilities from "./components/Utilities";
import {
  barLayout,
  barLock,
  barOrientation,
  barVisibility,
  emptyWorkspace,
  globalMargin,
} from "../../variables";
import { getMonitorName } from "../../utils/monitor";
import { LeftPanelVisibility } from "../leftPanel/LeftPanel";
import { RightPanelVisibility } from "../rightPanel/RightPanel";

export default (monitor: Gdk.Monitor) => {
  const monitorName = getMonitorName(monitor.get_display(), monitor)!;

  return (
    <window
      gdkmonitor={monitor}
      name={`bar-${monitorName}`}
      namespace="bar"
      className="Bar"
      application={App}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={bind(barOrientation).as((orientation) =>
        orientation
          ? Astal.WindowAnchor.TOP |
            Astal.WindowAnchor.LEFT |
            Astal.WindowAnchor.RIGHT
          : Astal.WindowAnchor.BOTTOM |
            Astal.WindowAnchor.LEFT |
            Astal.WindowAnchor.RIGHT
      )}
      margin={emptyWorkspace.as((empty) => (empty ? globalMargin : 5))}
      visible={bind(barVisibility)}
      child={
        <eventbox
          onHoverLost={() => {
            if (!barLock.get()) barVisibility.set(false);
          }}
          child={
            <box
              spacing={5}
              className={emptyWorkspace.as((empty) =>
                empty ? "bar empty" : "bar full"
              )}>
              <LeftPanelVisibility />
              <centerbox hexpand>
                {bind(barLayout).as((layout) =>
                  layout.map((widgetSelector, key) => {
                    // set halign based on the key
                    const halign = key === 0 ? Gtk.Align.START : Gtk.Align.END;
                    switch (widgetSelector.name) {
                      case "workspaces":
                        return (
                          <Workspaces
                            halign={halign}
                            monitorName={monitorName}
                          />
                        );
                      case "information":
                        return (
                          <Information
                            halign={halign}
                            monitorName={monitorName}
                          />
                        );
                      case "utilities":
                        return (
                          <Utilities
                            halign={halign}
                            monitorName={monitorName}
                          />
                        );
                    }
                  })
                )}
              </centerbox>
              <RightPanelVisibility />
            </box>
          }></eventbox>
      }></window>
  );
};
