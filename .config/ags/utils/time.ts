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

export function logTime(label: string, fn: () => void)
{
    const start = GLib.get_monotonic_time();
    fn();
    const end = GLib.get_monotonic_time();

    const time = (end - start) / 1000;  // Convert to ms

    // Define colors
    const reset = "\x1b[0m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const red = "\x1b[31m";

    // Choose color based on time
    let color = green;  // Fast
    if (time > 10) color = yellow; // Medium
    if (time > 100) color = red;  // Slow

    print(`${label}: ${color}${time} ms${reset}`);
}