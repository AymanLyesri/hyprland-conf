import { Api } from "./api.interface"


export interface Waifu
{
    id: number
    preview: string
    width: number
    height: number
    api: Api
}

export interface WaifuJson
{
    id: number
    created_at: string
    uploader_id: number
    score: number
    source: string
    md5: string
    last_comment_bumped_at: any
    rating: string
    image_width: number
    image_height: number
    tag_string: string
    fav_count: number
    file_ext: string
    last_noted_at: any
    parent_id: number
    has_children: boolean
    approver_id: any
    tag_count_general: number
    tag_count_artist: number
    tag_count_character: number
    tag_count_copyright: number
    file_size: number
    up_score: number
    down_score: number
    is_pending: boolean
    is_flagged: boolean
    is_deleted: boolean
    tag_count: number
    updated_at: string
    is_banned: boolean
    pixiv_id: number
    last_commented_at: any
    has_active_children: boolean
    bit_flags: number
    tag_count_meta: number
    has_large: boolean
    has_visible_children: boolean
    media_asset: MediaAsset
    tag_string_general: string
    tag_string_character: string
    tag_string_copyright: string
    tag_string_artist: string
    tag_string_meta: string
    file_url: string
    large_file_url: string
    preview_file_url: string
}

export interface MediaAsset
{
    id: number
    created_at: string
    updated_at: string
    md5: string
    file_ext: string
    file_size: number
    image_width: number
    image_height: number
    duration: any
    status: string
    file_key: string
    is_public: boolean
    pixel_hash: string
    variants: Variant[]
}

export interface Variant
{
    type: string
    url: string
    width: number
    height: number
    file_ext: string
}
