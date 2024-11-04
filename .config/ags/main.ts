import NotificationPopups from "widgets/NotificationPopups";
import RightPanel from "widgets/rightPanel/RightPanel";
import Bar from "widgets/bar/Bar";
import AppLauncher from "widgets/AppLauncher";
import MediaPopups from "widgets/MediaPopups";
import Progress from "widgets/Progress";
import WallpaperSwitcher from "widgets/WallpaperSwitcher";

import { getCssPath, refreshCss } from "utils/scss";
import BarHover from "widgets/bar/BarHover";
import RightPanelHover from "widgets/rightPanel/RightPanelHover";
import SettingsWidget from "widgets/SettingsWidget";
import UserPanel from "widgets/UserPanel";
import OSD from "widgets/OSD";

// required packages
// gvfs is required for images

refreshCss()

App.addIcons(`${App.configDir}/assets/icons`)
App.config({
  style: getCssPath(),
  windows: [
    Bar(),
    BarHover(),

    NotificationPopups(),

    RightPanel(),
    RightPanelHover(),

    WallpaperSwitcher(),

    MediaPopups(),
    AppLauncher(),
    Progress(),
    SettingsWidget(),
    UserPanel(),

    OSD(),
  ]
})


