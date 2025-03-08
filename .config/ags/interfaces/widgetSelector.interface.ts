import { Gtk } from "astal/gtk3";


export interface WidgetSelector
{
    name: string;
    icon: string;
    widget: () => Gtk.Widget;
    widgetInstance?: Gtk.Widget;  // To track the active widget instance
}