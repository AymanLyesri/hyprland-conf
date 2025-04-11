import { execAsync } from "astal";
import { LauncherApp } from "../interfaces/app.interface";
import { setGlobalTheme } from "../utils/theme";

export const customApps: LauncherApp[] = [
    {
        app_name: "Light Theme",
        app_icon: "",
        app_launch: () =>
        {
            setGlobalTheme("light");
        },
    },
    {
        app_name: "Dark Theme",
        app_icon: "",
        app_launch: () =>
        {
            setGlobalTheme("dark");
        },
    },
    {
        app_name: "System Sleep",
        app_icon: "",
        app_launch: () =>
        {
            execAsync(`bash -c "$HOME/.config/hypr/scripts/hyprlock.sh suspend"`);
        },
    },
    {
        app_name: "System Restart",
        app_icon: "󰜉",
        app_launch: () =>
        {
            execAsync(`reboot`);
        },
    },
    {
        app_name: "System Shutdown",
        app_icon: "",
        app_launch: () =>
        {
            execAsync(`shutdown now`);
        },
    },
];