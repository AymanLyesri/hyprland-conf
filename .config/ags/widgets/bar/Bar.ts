import { barPin, emptyWorkspace, globalMargin } from "variables";
import { Left } from "./components/barLeft";
import { Center } from "./components/barMiddle";
import { Right } from "./components/barRight";

export default () =>
{
    return Widget.Window({
        name: `bar`, // name has to be unique
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        margins: emptyWorkspace.as(margin => [margin * 69 + 5, margin * 50 + globalMargin, 0, margin * 50 + globalMargin]),// [top, right, bottom, left]
        layer: "top",
        visible: barPin.value,
        child: Widget.Box({
            css: `padding-bottom: 5px;`,
            child: Widget.EventBox({
                on_hover_lost: () => !barPin.value ? App.closeWindow("bar") : null,
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