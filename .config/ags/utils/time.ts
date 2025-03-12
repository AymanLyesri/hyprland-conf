import GLib from "gi://GLib?version=2.0";

export function time(time: number, format = "%H:%M")
{
    return GLib.DateTime
        .new_from_unix_local(time)
        .format(format)!
}

export function asyncSleep(INTERVAL: number)
{
    return new Promise(resolve => setTimeout(resolve, INTERVAL));
}
