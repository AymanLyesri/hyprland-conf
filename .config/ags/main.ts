import { Left } from "bar/bar_left";
import { Center } from "bar/bar_middle";
import { Right } from "bar/bar_right";
import { NotificationPopups } from "right_panel/notifications";
import { RightPanel } from "right_panel/right_panel";
import { appLauncherVisibility, bar_margin } from "variables";
import { AppLauncher } from "widgets/app-launcher";
import { Media } from "widgets/media";
import { Wallpapers } from "widgets/wallpaper";

appLauncherVisibility.value = false;

// required packages
// gvfs is required for images

function Bar(monitor = 0)
{
  return Widget.Window({
    name: `bar`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    margins: bar_margin.as(margin => [margin * 6.9 + 5, margin * 5 + 5, 0, margin * 5 + 5]),// [top, right, bottom, left]
    layer: "top",

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

refreshCss()

App.addIcons(`${App.configDir}/assets`)
App.config({
  style: css,
  windows: [
    Bar(),
    await RightPanel(),
    await NotificationPopups(),
    await Wallpapers(),
    await Media(),
    await AppLauncher(),
    // you can call it, for each monitor
    // Bar(0),
    // Bar(1)
  ],
});

