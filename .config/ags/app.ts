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
import { getMonitorName } from "./utils/monitor"
import { logTime } from "./utils/time"


const main = () => App.get_monitors().map(monitor =>
{
    print("\t MONITOR: " + getMonitorName(monitor.get_display(), monitor));

    logTime("\t\t Bar", () => Bar(monitor));
    logTime("\t\t BarHover", () => BarHover(monitor));
    logTime("\t\t RightPanel", () => RightPanel(monitor));
    logTime("\t\t RightPanelHover", () => RightPanelHover(monitor));
    logTime("\t\t NotificationPopups", () => NotificationPopups(monitor));
    logTime("\t\t AppLauncher", () => AppLauncher(monitor));
    logTime("\t\t Progress", () => Progress(monitor));
    logTime("\t\t UserPanel", () => UserPanel(monitor));
    logTime("\t\t WallpaperSwitcher", () => WallpaperSwitcher(monitor));
    logTime("\t\t MediaPopups", () => MediaPopups(monitor));
    logTime("\t\t SettingsWidget", () => SettingsWidget(monitor));
    logTime("\t\t OSD", () => OSD(monitor));
});


App.start({
    css: getCssPath(),
    main()
    {
        logTime("Main", main);
    },
});