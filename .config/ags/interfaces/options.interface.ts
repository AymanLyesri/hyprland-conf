
interface HyprlandSetting
{
    value: any,
    type: string,
    min: number,
    max: number,
}

interface Settings
{
    hyprsunset: {
        kelvin: number,
    },
    hyprland: {
        decoration: {
            rounding: HyprlandSetting,
            active_opacity: HyprlandSetting,
            inactive_opacity: HyprlandSetting
            blur: {
                enabled: HyprlandSetting,
                size: HyprlandSetting,
                passes: HyprlandSetting,
            }
        }
    }
    notifications: {
        dnd: boolean,
    }
    globalOpacity: number,
    bar: {
        visibility: boolean,
        lock: boolean,
    }
    waifu: {
        visibility: boolean,
        input_history: string,
        current: string,
        favorites: {
            id: string,
            preview: string,
        }[],
    }
    rightPanel: {
        visibility: boolean,
        exclusivity: boolean,
        width: number,
        widgets: string[],
        lock: boolean,
    },
    quickLauncher: {
        apps: {
            name: string,
            app_name: string,
            exec: string,
            icon: string,
        }[]
    }
}