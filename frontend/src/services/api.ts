import axios from 'axios';
import type {
    Set,
    SetWithParts,
    MissingPart,
    CreateSetRequest,
    AssignMissingPartsRequest,
    ApiResponse
} from '../types/api';

// Get API base URL from environment variable or fallback to default
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

const apiv1 = axios.create({
    baseURL: `${apiBaseUrl}/api/${apiVersion}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Health check instance (without /api/v1 prefix)
const healthClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Sets API
export const setsApi = {
    getAll: () => apiv1.get<{ sets: Set[] }>('/sets'),
    getById: (id: number) => apiv1.get<Set>(`/sets/${id}`),
    getByIdWithParts: (id: number) => apiv1.get<SetWithParts>(`/sets/${id}/with-parts`),
    getBySetNum: (setNum: string) => apiv1.get<Set>(`/sets/by-num/${setNum}`),
    create: (data: CreateSetRequest) => apiv1.post<Set>('/sets', data),
    createWithParts: (data: CreateSetRequest) => apiv1.post<SetWithParts>('/sets/with-parts', data),
    update: (id: number, data: Partial<Set>) => apiv1.put<Set>(`/sets/${id}`, data),
    delete: (id: number) => apiv1.delete(`/sets/${id}`),
};

// Missing Parts API
export const missingPartsApi = {
    getBySetId: (setId: number) => apiv1.get<MissingPart[]>(`/missing-parts/${setId}`),
    assign: (data: AssignMissingPartsRequest) => apiv1.post<ApiResponse<string>>('/missing-parts', data),
};

// Health Check (uses base URL without /api/v1)
export const healthApi = {
    check: () => healthClient.get('/health'),
};

export default apiv1;