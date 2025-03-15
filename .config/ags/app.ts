import { App } from "astal/gtk3"
import Bar from "./widgets/bar/Bar"
import { getCssPath } from "./utils/scss"
import RightPanel from "./widgets/rightPanel/RightPanel"
import RightPanelHover from "./widgets/rightPanel/RightPanelHover"
import NotificationPopups from "./widgets/NotificationPopups"
import AppLauncher from "./widgets/AppLauncher"
import Progress from "./widgets/Progress"
import UserPanel from "./widgets/UserPanel"
import WallpaperSwitcher from "./widgets/WallpaperSwitcher"
import MediaPopups from "./widgets/MediaPopups"
import SettingsWidget from "./widgets/SettingsWidget"
import BarHover from "./widgets/bar/BarHover"
import OSD from "./widgets/OSD"

App.start({
    css: getCssPath(),
    main()
    {
        Bar()
        BarHover()

        RightPanel()
        RightPanelHover()

        NotificationPopups()

        AppLauncher()

        Progress()

        UserPanel()

        WallpaperSwitcher()

        MediaPopups()

        SettingsWidget()

        OSD()

        console.log("App started");

    },
})
