const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message)
        this.name = "ApiError"
    }
}

export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const res = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(
            res.status,
            data?.message || "An unexpected error occured",
            data,
        );
    }

    return data;
}