// API Types based on your Go backend

export interface Set {
    id: number;
    set_num: string;
    name: string;
    year: number;
    theme_id: number;
    num_parts: number;
    set_img_url: string;
    set_url: string;
    last_modified_dt: string;
    created_at: string;
    updated_at: string;
}

export interface Part {
    id: number;
    part_num: string;
    name: string;
    part_cat_id: number;
    part_url: string;
    part_img_url: string;
    external_ids: string;
    print_of: string;
    created_at: string;
    updated_at: string;
}

export interface SetPart {
    id: number;
    set_id: number;
    part_id: number;
    color_id: number;
    quantity: number;
    is_spare: boolean;
    element_id: string;
    created_at: string;
    updated_at: string;
    part?: Part;
}

export interface MissingPart {
    id: number;
    set_id: number;
    part_id: number;
    color_id: number;
    color_name: string;
    color_hex: string;
    quantity: number;
    is_missing: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
    set?: Set;
    part?: Part;
}

export interface SetWithParts extends Set {
    set_parts?: SetPart[];
}

export interface CreateSetRequest {
    set_num: string;
}

export interface AssignMissingPartsRequest {
    set_id: number;
    part_requests: {
        set_part_id: number;
        quantity: number;
    }[];
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    error: string;
    details?: string;
}
