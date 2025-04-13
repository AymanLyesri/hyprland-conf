import { Gtk } from "astal/gtk3";
import { globalTransition } from "../variables";

export default ({
  trigger,
  child,
  visible = true,
  custom_class = "",
  on_primary_click = () => {},
}: {
  trigger: Gtk.Widget;
  child: Gtk.Widget;
  visible?: boolean;
  custom_class?: string;
  on_primary_click?: () => void;
}) => {
  const revealer = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      child={child}
    />
  );

  const eventBox = (
    <eventbox
      visible={visible}
      className={"custom-revealer " + custom_class}
      on_hover={(self) => {
        revealer.reveal_child = true;
      }}
      on_hover_lost={() => {
        revealer.reveal_child = false;
      }}
      onClick={on_primary_click}
      child={
        <box className={"content"}>
          {trigger}
          {revealer}
        </box>
      }
    />
  );

  return eventBox;
};
