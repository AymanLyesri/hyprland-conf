import { Astal } from "astal/gtk3";
import { Variable } from "astal";
import barLeft from "./components/barLeft";
import barMiddle from "./components/barMiddle";
import barRight from "./components/barRight";
import { emptyWorkspace } from "../../variables";

// const time = Variable("").poll(1000, "date");

export default () => {
  return (
    <window
      className="Bar"
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      visible={true}>
      <eventbox
      // onLeaveNotifyEvent={(self, event: Gdk.Event) => {
      //   const [_, x, y] = event.get_root_coords();
      //   if (y >= 25 && !barLock.get()) App.closeWindow("bar");
      // }}
      >
        <centerbox className={emptyWorkspace ? "bar empty" : "bar full"}>
          <box name="start-widget">{barLeft()}</box>
          <box name="center-widget">{barMiddle()}</box>
          <box name="end-widget">{barRight()}</box>
        </centerbox>
      </eventbox>
    </window>
  );
};

// export default () => {
//   return Widget.Window({
//     name: `bar`,
//     anchor: ["top", "left", "right"],
//     exclusivity: "exclusive",
//     margins: emptyWorkspace.as((margin) => [
//       margin * 25,
//       margin * 25,
//       0,
//       margin * 25,
//     ]), // [top, right, bottom, left]
//     layer: "top",
//     visible: barLock.get(),
//     child: Widget.EventBox({
//       // on_hover_lost: () => !barLock.get() ? App.closeWindow("bar") : null,
//       child: Widget.CenterBox({
//         class_name: emptyWorkspace.as((empty) =>
//           !!empty ? "bar empty" : "bar full"
//         ),
//         start_widget: Left(),
//         center_widget: Center(),
//         end_widget: Right(),
//       }),
//       setup: (self) =>
//         self.on("leave-notify-event", (self, event: Gdk.Event) => {
//           const [_, x, y] = event.get_root_coords();
//           if (y >= 25 && !barLock.get()) App.closeWindow("bar");
//         }),
//     }),
//   });
// };
