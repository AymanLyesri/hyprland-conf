import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import { Left } from "./components/barLeft";
import { Center } from "./components/barMiddle";
import { Right } from "./components/barRight";
import { emptyWorkspace } from "../../variables";

const time = Variable("").poll(1000, "date");

export default (gdkmonitor: Gdk.Monitor) => {
  return (
    <window
      className="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      application={App}
      marginTop={0}
      marginRight={0}
      marginLeft={0}
      marginBottom={0}
      visible={true}>
      <eventbox
      // onLeaveNotifyEvent={(self, event: Gdk.Event) => {
      //   const [_, x, y] = event.get_root_coords();
      //   if (y >= 25 && !barLock.value) App.closeWindow("bar");
      // }}
      >
        <centerbox className={emptyWorkspace ? "bar empty" : "bar full"}>
          <box name="start-widget">{Left()}</box>
          <box name="center-widget">{Center()}</box>
          <box name="end-widget">{Right()}</box>
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
//     visible: barLock.value,
//     child: Widget.EventBox({
//       // on_hover_lost: () => !barLock.value ? App.closeWindow("bar") : null,
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
//           if (y >= 25 && !barLock.value) App.closeWindow("bar");
//         }),
//     }),
//   });
// };
