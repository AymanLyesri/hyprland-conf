interface Settings
{
    hyprland: {
        decoration: {
            active_opacity: number,
            inactive_opacity: number,
        }
    }
    globalOpacity: number,
    bar: {
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
    }
}