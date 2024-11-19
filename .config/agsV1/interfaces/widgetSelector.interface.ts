import Gtk from "types/@girs/gtk-3.0/gtk-3.0";

export interface WidgetSelector
{
    name: string;
    icon: string;
    widget: () => Gtk.Widget;
    widgetInstance?: Gtk.Widget;  // To track the active widget instance
}