import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Window } from "../../../../../../usr/share/astal/gjs/gtk3/widget";

export default () => {
  // return Widget.Window({
  //     name: `bar-hover`, // name has to be unique
  //     anchor: ["top", "left", "right"],
  //     exclusivity: "ignore",
  //     layer: "overlay",
  //     child: Widget.EventBox({
  //         hexpand: true,
  //         vexpand: true,
  //         on_hover: () => App.openWindow("bar"),
  //         child: Widget.Box({ css: `min-height: 5px;` }),
  //     }),
  // });

  return (
    <Window
      name="bar-hover"
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.OVERLAY}>
      <eventbox onHover={() => {}}>
        <box css="min-height: 5px;" />
      </eventbox>
    </Window>
  );
};
