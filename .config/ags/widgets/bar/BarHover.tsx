import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Window } from "../../../../../../usr/share/astal/gjs/gtk3/widget";
import { barVisibility } from "../../variables";

export default () => {
  return (
    <Window
      name="bar-hover"
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      child={
        <eventbox
          onHover={() => {
            barVisibility.set(true);
          }}
          child={<box css="min-height: 5px;" />}></eventbox>
      }></Window>
  );
};
