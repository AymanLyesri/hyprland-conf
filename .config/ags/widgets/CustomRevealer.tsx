import { Gtk } from "astal/gtk3";
import { globalTransition } from "../variables";

export default (
  trigger: any,
  child: any,
  custom_class = "",
  on_primary_click = () => {},
  vertical = false
) => {
  const revealer = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transitionType={
        vertical
          ? Gtk.RevealerTransitionType.SLIDE_UP
          : Gtk.RevealerTransitionType.SLIDE_RIGHT
      }
      child={child}
    />
  );

  const eventBox = (
    <eventbox
      className={"custom-revealer button " + custom_class}
      on_hover={(self) => {
        revealer.reveal_child = true;
      }}
      on_hover_lost={() => {
        revealer.reveal_child = false;
      }}
      onClick={on_primary_click}
      child={
        <box vertical={vertical}>
          {trigger}
          {revealer}
        </box>
      }
    />
  );

  return eventBox;
};
