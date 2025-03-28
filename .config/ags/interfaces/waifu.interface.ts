import { Api } from "./api.interface"


export interface Waifu
{
    id: number;
    url?: string;
    url_path?: string;
    preview?: string;
    preview_path?: string;
    width: number;
    height: number;
    api: Api;
}

export class WaifuClass implements Waifu
{  // Implement the Waifu interface
    id: number;
    url?: string;
    url_path?: string;
    preview?: string;
    preview_path?: string;
    width: number;
    height: number;
    api: Api;

    constructor(waifu: Waifu = {} as Waifu)
    {
        this.id = waifu.id;
        this.url = waifu.url;
        this.url_path = waifu.url_path;
        this.preview = waifu.preview;
        this.preview_path = waifu.preview_path;
        this.width = waifu.width;
        this.height = waifu.height;
        this.api = waifu.api;
    }
}
