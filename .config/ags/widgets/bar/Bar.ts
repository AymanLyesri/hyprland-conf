import { barLock, emptyWorkspace, globalMargin } from "variables";
import { Left } from "./components/barLeft";
import { Center } from "./components/barMiddle";
import { Right } from "./components/barRight";

export default () =>
{
    return Widget.Window({
        name: `bar`,
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        margins: emptyWorkspace.as(margin => [margin * 69, margin * 50, 0, margin * 50]),// [top, right, bottom, left]
        layer: "top",
        visible: barLock.value,
        child: Widget.Box({
            css: `padding-bottom: 5px;`,
            child: Widget.EventBox({
                on_hover_lost: () => !barLock.value ? App.closeWindow("bar") : null,
                child: Widget.CenterBox({
                    class_name: emptyWorkspace.as(empty => !!empty ? "bar empty" : "bar full"),
                    start_widget: Left(),
                    center_widget: Center(),
                    end_widget: Right(),
                }),
            }),
        })
    });
}