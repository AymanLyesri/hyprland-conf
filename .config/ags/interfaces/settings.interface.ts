import { Api } from "./api.interface"
import { Waifu } from "./waifu.interface"

export interface HyprlandSetting
{
    value: any,
    type: string,
    min: number,
    max: number,
}

export interface AGSSetting
{
    name: string,
    value: any,
    type: string,
    min: number,
    max: number,
}

export interface Settings
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
    globalOpacity: AGSSetting,
    globalIconSize: AGSSetting,
    bar: {
        visibility: boolean,
        lock: boolean,
        orientation: boolean,
    }
    waifu: {
        visibility: boolean,
        input_history: string,
        current: Waifu,
        api: Api,
        favorites: Waifu[],
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