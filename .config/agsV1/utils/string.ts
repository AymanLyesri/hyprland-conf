export function getArgumentAfterSpace(input: string): string | null
{
    const spaceIndex = input.indexOf(' ');

    if (spaceIndex === -1) {
        return null; // Return null if there's no space in the string
    }

    return input.slice(spaceIndex + 1);
}

export function getArgumentBeforeSpace(input: string): string
{
    const spaceIndex = input.indexOf(' ');

    // if (spaceIndex === -1) {
    //     return null; // Return null if there's no space in the string
    // }

    return input.slice(0, spaceIndex);
}