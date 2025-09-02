import type { Request } from 'express';
export declare function initializeApplication(): Promise<void>;
/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @param request The request object
 * @returns The application URL
 */
export declare function getApplicationUrl(request: Request): string;
