import {
  Box,
  EventBox,
  Revealer,
} from "../../../../../usr/share/astal/gjs/gtk3/widget";
import { globalTransition } from "../variables";

export function custom_revealer(
  trigger: any,
  slider: any,
  custom_class = "",
  on_primary_click = () => {},
  vertical = false
) {
  // const revealer = Widget.Revealer({
  //     revealChild: false,
  //     transitionDuration: globalTransition,
  //     transition: vertical ? 'slide_up' : 'slide_right',
  //     child: slider,
  // });

  const revealer = (
    <Revealer
      revealChild={false}
      transitionDuration={globalTransition}
      //   transitionType={vertical ? "slide_up" : "slide_right"}
    >
      {slider}
    </Revealer>
  );

  //   const eventBox = Widget.EventBox({
  //     class_names: ["custom-revealer", "button", custom_class],
  //     on_hover: async (self) => {
  //       revealer.reveal_child = true;
  //     },
  //     on_hover_lost: async () => {
  //       revealer.reveal_child = false;
  //     },
  //     on_primary_click: on_primary_click,
  //     child: Widget.Box({
  //       vertical: vertical,
  //       children: [trigger, revealer],
  //     }),
  //   });

  const eventBox = (
    <EventBox
      className={["custom-revealer", "button", custom_class].join(" ")}
      onHover={async (self) => {
        // revealer.child = true;
      }}
      onHoverLost={async () => {
        // revealer.revealChild = false;
      }}
      onClick={on_primary_click}>
      <Box vertical={vertical}>
        {trigger}
        {revealer}
      </Box>
    </EventBox>
  );

  return eventBox;
}
