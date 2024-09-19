import NotificationPopups from "right_panel/NotificationPopups";
import RightPanel from "right_panel/RightPanel";
import Bar from "bar/Bar";
import AppLauncher from "widgets/AppLauncher";
import Media from "widgets/Media";
import Progress from "widgets/Progress";
import WallpaperSwitcher from "widgets/WallpaperSwitcher";

import { getCssPath, refreshCss } from "utils/scss";

// required packages
// gvfs is required for images

refreshCss()

App.addIcons(`${App.configDir}/assets`)
App.config({
  style: getCssPath(),
  windows: [
    Bar(),
    NotificationPopups(),
    RightPanel(),
    WallpaperSwitcher(),
    Media(),
    AppLauncher(),
    Progress(),
  ],
});

