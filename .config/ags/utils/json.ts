export function readJSONFile(filePath: string): any
{
    if (Utils.readFile(filePath) == '') return {};
    try {
        const data = Utils.readFile(filePath);
        return data.trim() ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error:', e);
        return {};
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

export function writeJSONFile(filePath: string, data: any)
{
    if (Utils.readFile(filePath) == '') Utils.exec(`mkdir -p ${filePath.split('/').slice(0, -1).join('/')}`);
    try {
        Utils.writeFile(JSON.stringify(data, null, 4), filePath);
    } catch (e) {
        console.error('Error:', e);
    }
}