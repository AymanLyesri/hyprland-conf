import NotificationPopups from "widgets/rightPanel/NotificationPopups";
import RightPanel from "widgets/rightPanel/RightPanel";
import Bar from "widgets/bar/Bar";
import AppLauncher from "widgets/AppLauncher";
import Media from "widgets/Media";
import Progress from "widgets/Progress";
import WallpaperSwitcher from "widgets/WallpaperSwitcher";

import { getCssPath, refreshCss } from "utils/scss";

// required packages
// gvfs is required for images



refreshCss()

App.addIcons(`${App.configDir}/assets/icons`)
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
  closeWindowDelay: {
    // "media": 5000, // milliseconds
    // "right-panel": 5000, // milliseconds
  },
})


