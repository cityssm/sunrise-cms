import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoDeleteUserResponse = {
    message: string;
    success: false;
} | {
    message: string;
    success: true;
    users: DatabaseUser[];
};
export default function handler(request: Request<unknown, unknown, {
    userName?: string;
}>, response: Response<DoDeleteUserResponse>): void;
