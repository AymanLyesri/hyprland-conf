import NotificationPopups from "widgets/rightPanel/NotificationPopups";
import NotificationPopups_NEW from "widgets/rightPanel/NotificationPopups_not_mine_and_too_complicated_for_no_reason";
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
    // NotificationPopups_NEW(),
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


