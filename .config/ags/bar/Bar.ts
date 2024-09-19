import { emptyWorkspace } from "variables";
import { Left } from "./components/barLeft";
import { Center } from "./components/barMiddle";
import { Right } from "./components/barRight";

export default () =>
{
    return Widget.Window({
        name: `bar`, // name has to be unique
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        margins: emptyWorkspace.as(margin => [margin * 69, margin * 50 + 10, 0, margin * 50 + 10]),// [top, right, bottom, left]
        layer: "overlay",

        child: Widget.CenterBox({
            class_name: emptyWorkspace.as(empty => !!empty ? "bar empty" : "bar full"),
            start_widget: Left(),
            center_widget: Center(),
            end_widget: Right(),
        }),
    });
}