export function apiRequest(endpoint: string, options?: any, requiresAuth?: boolean): Promise<any>;
export function setAuthToken(token: string): void;
export function getAuthToken(): string | null;
export function clearAuthToken(): void;
export function getUserData(): any;