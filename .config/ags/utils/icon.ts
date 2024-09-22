export function playerToIcon(name)
{
    let icons = {
        spotify: "󰓇",
        VLC: "󰓈",
        YouTube: "󰓉",
        Brave: "󰓊",
        Audacious: "󰓋",
        Rhythmbox: "󰓌",
        Chromium: "󰓍",
        Firefox: "󰈹",
        firefox: "󰈹",
    }

    return icons[name]
}