import { Left } from "bar/bar_left";
import { Center } from "bar/bar_middle";
import { Right } from "bar/bar_right";
import { bar_margins } from "variables";

function Bar(monitor = 0)
{
  return Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    margins: bar_margins,// [top, right, bottom, left]

    child: Widget.CenterBox({
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  });
}

// target css file
const css = `/tmp/tmp-style.css`

function refreshCss()
{
  // main scss file
  const scss = `${App.configDir}/scss/style.scss`
  Utils.exec(`sassc ${scss} ${css}`)
  App.resetCss()
  App.applyCss(css)
}

Utils.monitorFile(
  // directory that contains the scss files
  `${App.configDir}/scss`,
  () => refreshCss()
)

Utils.monitorFile(
  "/home/ayman/.cache/wal/colors.scss",
  () => refreshCss()
)

App.config({
  style: css,
  windows: [
    Bar(),

    // you can call it, for each monitor
    // Bar(0),
    // Bar(1)
  ],
});

export { };
