import { exec, readFile, writeFile } from "astal";


export function readJSONFile(filePath: string): any
{
    if (readFile(filePath) == '') return {};
    try {
        const data = readFile(filePath);
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
    if (readFile(filePath) == '') exec(`mkdir -p ${filePath.split('/').slice(0, -1).join('/')}`);
    try {
        writeFile(filePath, JSON.stringify(data, null, 4));
    } catch (e) {
        console.error('Error:', e);
    }
}