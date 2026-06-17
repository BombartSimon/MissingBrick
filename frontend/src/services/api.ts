import axios from 'axios';
import type {
    Set,
    SetWithParts,
    MissingPart,
    CreateSetRequest,
    AssignMissingPartsRequest,
    UpdateMissingPartRequest,
    SetPart,
    RebrickableSetResponse,
    ShoppingListItem,
    SetPhoto,
    UpdateSetNotesRequest,
    UpdateSetPhotoRequest,
    PhotoType
} from '../types/api';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error;
        if (typeof message === 'string' && message.length > 0) return message;
        if (error.message) return error.message;
    }
    if (error instanceof Error) return error.message;
    return 'Unexpected error';
};

const apiv1 = axios.create({
    baseURL: `${apiBaseUrl}/api/${apiVersion}`,
    headers: { 'Content-Type': 'application/json' },
});

const healthClient = axios.create({
    baseURL: apiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
});

export const setsApi = {
    getAll: () => apiv1.get<{ sets: Set[] }>('/sets'),
    getById: (id: number) => apiv1.get<Set>(`/sets/${id}`),
    getByIdWithParts: (id: number) => apiv1.get<SetWithParts>(`/sets/${id}/with-parts`),
    getBySetNum: (setNum: string) => apiv1.get<Set>(`/sets/by-num/${setNum}`),
    create: (data: CreateSetRequest) => apiv1.post<Set>('/sets', data),
    update: (id: number, data: Partial<Set>) => apiv1.put<Set>(`/sets/${id}`, data),
    delete: (id: number) => apiv1.delete(`/sets/${id}`),
    updateNotes: (id: number, data: UpdateSetNotesRequest) => apiv1.put<Set>(`/sets/${id}/notes`, data),
};

export const setPhotosApi = {
    list: (setId: number) => apiv1.get<{ photos: SetPhoto[] }>(`/sets/${setId}/photos`),
    upload: (setId: number, file: File, data: { title?: string; photo_type?: PhotoType; is_primary?: boolean }) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('photo_type', data.photo_type || 'other');
        formData.append('title', data.title || '');
        formData.append('is_primary', data.is_primary ? 'true' : 'false');
        return apiv1.post<SetPhoto>(`/sets/${setId}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    update: (setId: number, photoId: number, data: UpdateSetPhotoRequest) => apiv1.put<SetPhoto>(`/sets/${setId}/photos/${photoId}`, data),
    delete: (setId: number, photoId: number) => apiv1.delete(`/sets/${setId}/photos/${photoId}`),
};

export const resolveAssetUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiBaseUrl}${url}`;
};

export const setPartsApi = {
    getBySetId: (setId: number) => apiv1.get<{ set_parts: SetPart[] }>(`/set-parts/${setId}`),
};

export const missingPartsApi = {
    getAll: () => apiv1.get<{ missing_parts: MissingPart[] }>('/missing-parts'),
    getBySetId: (setId: number) => apiv1.get<MissingPart[]>(`/missing-parts/${setId}`),
    shoppingList: () => apiv1.get<{ items: ShoppingListItem[] }>('/missing-parts/shopping-list'),
    assign: (data: AssignMissingPartsRequest) => apiv1.post<MissingPart[]>('/missing-parts', data),
    update: (missingPartId: number, data: UpdateMissingPartRequest) => apiv1.put<MissingPart>(`/missing-parts/${missingPartId}`, data),
    delete: (missingPartId: number) => apiv1.delete(`/missing-parts/${missingPartId}`),
};

export const healthApi = {
    check: () => healthClient.get('/health'),
};

export const searchSets = async (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    signal?: AbortSignal
): Promise<RebrickableSetResponse> => {
    const response = await apiv1.get<RebrickableSetResponse>('/search/sets', {
        params: { search: searchTerm, page, page_size: pageSize },
        signal,
    });
    return response.data;
};

export default apiv1;
