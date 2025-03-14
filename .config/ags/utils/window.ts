import { App } from "astal/gtk3";

export function hideWindow(window_name: string)
{
    App.get_window(window_name)!.hide();
}