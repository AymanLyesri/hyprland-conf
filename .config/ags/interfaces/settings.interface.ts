import { Api } from "./api.interface"
import { Provider } from "./chatbot.interface"
import { Waifu } from "./waifu.interface"
import { WidgetSelector } from "./widgetSelector.interface"

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
        widgets: WidgetSelector[]
        lock: boolean,
    },
    chatBot: {
        provider: Provider,
    },
    booru: {
        api: Api,
        tags: string[],
        limit: number,
        page: number,
    },
    leftPanel: {
        visibility: boolean,
        exclusivity: boolean,
        width: number,
        lock: boolean,
        widget: WidgetSelector
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