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
];