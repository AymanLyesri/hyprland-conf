import { barLock, emptyWorkspace, globalMargin } from "variables";
import BarLeft from "./components/BarLeft";
import BarMiddle from "./components/BarMiddle";
import BarRight from "./components/BarRight";
import Gdk from "gi://Gdk?version=3.0";

export default () =>
{
    return Widget.Window({
        name: `bar`,
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        margins: emptyWorkspace.as(margin => [margin * 25, margin * 25, 0, margin * 25]),// [top, right, bottom, left]
        layer: "top",
        visible: barLock.value,
        child: Widget.EventBox({
            // on_hover_lost: () => !barLock.value ? App.closeWindow("bar") : null,
            child: Widget.CenterBox({
                class_name: emptyWorkspace.as(empty => !!empty ? "bar empty" : "bar full"),
                start_widget: BarLeft(),
                center_widget: BarMiddle(),
                end_widget: BarRight(),
            }),
            setup: (self) => self.on('leave-notify-event', (self, event: Gdk.Event) =>
            {
                const [_, x, y] = event.get_root_coords();
                if (y >= 25 && !barLock.value) App.closeWindow("bar")
            })
        })

    });
}