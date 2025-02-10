import { Gtk } from "astal/gtk3";
import { globalTransition } from "../variables";

export default (
  trigger: any,
  slider: any,
  custom_class = "",
  on_primary_click = () => {},
  vertical = false
) => {
  // const revealer = Widget.Revealer({
  //   revealChild: false,
  //   transitionDuration: globalTransition,
  //   transition: vertical ? "slide_up" : "slide_right",
  //   child: slider,
  // });

  const revealer = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transitionType={
        vertical
          ? Gtk.RevealerTransitionType.SLIDE_UP
          : Gtk.RevealerTransitionType.SLIDE_RIGHT
      }
      child={slider}
    />
  );

  {
    /* const eventBox = Widget.EventBox({
    class_names: ["custom-revealer", "button", custom_class],
    on_hover: async (self) => {
      revealer.reveal_child = true;
    },
    on_hover_lost: async () => {
      revealer.reveal_child = false;
    },
    on_primary_click: on_primary_click,
    child: Widget.Box({
      vertical: vertical,
      children: [trigger, revealer],
    }),
  }); */
  }

  const eventBox = (
    <eventbox
      className={"custom-revealer button " + custom_class}
      on_hover={(self) => {
        revealer.reveal_child = true;
      }}
      on_hover_lost={() => {
        revealer.reveal_child = false;
      }}
      on_primary_click={on_primary_click}
      child={
        <box vertical>
          {trigger}
          {revealer}
        </box>
      }
    />
  );

  return eventBox;
};
