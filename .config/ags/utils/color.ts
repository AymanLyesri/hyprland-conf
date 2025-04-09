export function getComplementaryColor(hex: string): string
{
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Get the complementary color
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;

    // Convert back to a hex string and return
    return '#' + [r, g, b].map(x =>
    {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function playerToColor(name: string)
{
    let colors = {
        spotify: "#1ED760",
        VLC: "#FF9500",
        YouTube: "#FF0000",
        Brave: "#FF9500",
        Audacious: "#FF9500",
        Rhythmbox: "#FF9500",
        Chromium: "#FF9500",
        Firefox: "#FF9500",
        firefox: "#FF9500",
    }

    if (colors[name] === undefined)
        return "#FFFFFF"

    return colors[name]
}