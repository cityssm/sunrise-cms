import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoToggleUserPermissionResponse = {
    message: string;
    success: true;
    users: DatabaseUser[];
} | {
    message: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoToggleUserPermissionResponse>): void;
