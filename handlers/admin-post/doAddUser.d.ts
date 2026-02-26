import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoAddUserResponse = {
    success: boolean;
    users: DatabaseUser[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoAddUserResponse>): void;
