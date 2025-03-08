import { Astal } from "astal/gtk3";
import { rightPanelVisibility } from "../../variables";

export default () => {
  //   return Widget.Window({
  //     name: `right-panel-hover`, // name has to be unique
  //     anchor: ["right", "top", "bottom"],
  //     exclusivity: "ignore",
  //     layer: "top",
  //     child: Widget.EventBox({
  //       hexpand: true,
  //       vexpand: true,
  //       on_hover: () => (rightPanelVisibility.get() = true),
  //       child: Widget.Box({ css: `min-width: 1px;` }),
  //     }),
  //   });
  console.log("RightPanelHover");

  return (
    <window
      className="RightPanel"
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }>
      <eventbox
        onHover={() => {
          console.log("hovered");
          rightPanelVisibility.set(true);
        }}
        vexpand={true}
        hexpand={true}>
        <box css="min-width: 1px" />
      </eventbox>
    </window>
  );
};
