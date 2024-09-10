export function readJSONFile(filePath: string): any
{
    try {
        const data = Utils.readFile(filePath);
        return data.trim() ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error:', e);
        return null;
    }
}

export function readJson(string: string)
{
    try {
        return JSON.parse(string);
    } catch (e) {
        console.error('Error:', e);
        return "null";
    }
}