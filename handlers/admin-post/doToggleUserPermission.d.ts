import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoToggleUserPermissionResponse = {
    message: string;
    success: false;
} | {
    message: string;
    success: true;
    users: DatabaseUser[];
};
export default function handler(request: Request, response: Response<DoToggleUserPermissionResponse>): void;
