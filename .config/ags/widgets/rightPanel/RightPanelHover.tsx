import { Astal } from "astal/gtk3";
import { rightPanelVisibility } from "../../variables";
import { bind } from "astal";

export default () => {
  return (
    <window
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
            if (!rightPanelVisibility.get()) rightPanelVisibility.set(true);
          }}
          vexpand={true}
          hexpand={true}
          child={<box css="min-width: 1px" />}></eventbox>
      }></window>
  );
};
