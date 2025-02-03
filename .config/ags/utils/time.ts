import GLib from "types/@girs/glib-2.0/glib-2.0";

export function time(time: number, format = "%H:%M")
{
    return GLib.DateTime
        .new_from_unix_local(time)
        .format(format)!
}