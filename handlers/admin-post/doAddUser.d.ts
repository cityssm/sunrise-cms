import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoAddUserResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    users: DatabaseUser[];
};
export default function handler(request: Request, response: Response<DoAddUserResponse>): void;
