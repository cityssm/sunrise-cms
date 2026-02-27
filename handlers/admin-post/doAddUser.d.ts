import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoAddUserResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    users: DatabaseUser[];
};
export default function handler(request: Request<unknown, unknown, {
    userName: string;
    canUpdateCemeteries?: string;
    canUpdateContracts?: string;
    canUpdateWorkOrders?: string;
    isAdmin?: string;
}>, response: Response<DoAddUserResponse>): void;
