import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Window } from "../../../../../../usr/share/astal/gjs/gtk3/widget";
import { barOrientation, barVisibility } from "../../variables";
import { bind } from "astal";

export default () => {
  return (
    <Window
      name="bar-hover"
      anchor={bind(barOrientation).as((orientation) =>
        orientation
          ? Astal.WindowAnchor.TOP |
            Astal.WindowAnchor.LEFT |
            Astal.WindowAnchor.RIGHT
          : Astal.WindowAnchor.BOTTOM |
            Astal.WindowAnchor.LEFT |
            Astal.WindowAnchor.RIGHT
      )}
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
