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
    notes: string;
    storage_location: string;
    build_status: BuildStatus;
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
    color_name: string;
    color_hex: string;
    quantity: number;
    is_spare: boolean;
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

export interface ShoppingListItem {
    part_id: number;
    part_num: string;
    part_name: string;
    part_img_url: string;
    part_url: string;
    color_id: number;
    color_name: string;
    color_hex: string;
    total_quantity: number;
    set_count: number;
    set_names: string;
}

export type BuildStatus = 'not_started' | 'sorting' | 'building' | 'blocked' | 'complete';

export type PhotoType = 'box' | 'instructions' | 'storage' | 'build' | 'other';

export interface SetPhoto {
    id: number;
    set_id: number;
    file_name: string;
    original_name: string;
    content_type: string;
    size_bytes: number;
    url: string;
    title: string;
    photo_type: PhotoType;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface SetWithParts extends Set {
    set_parts?: SetPart[];
    photos?: SetPhoto[];
}

export interface UpdateSetNotesRequest {
    notes: string;
    storage_location: string;
    build_status: BuildStatus;
}

export interface UpdateSetPhotoRequest {
    title?: string;
    photo_type?: PhotoType;
    is_primary?: boolean;
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

export interface UpdateMissingPartRequest {
    quantity?: number;
    notes?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    error: string;
    details?: string;
}

export interface RebrickableSet {
    set_num: string;
    name: string;
    year: number;
    theme_id: number;
    num_parts: number;
    set_img_url: string;
    set_url: string;
    last_modified_dt: string;
}

export interface RebrickableSetResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: RebrickableSet[];
}
