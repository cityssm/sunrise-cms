import type { Request, Response } from 'express';
import { type UpdateIntermentDepthForm } from '../../database/updateIntermentDepth.js';
import type { IntermentDepth } from '../../types/record.types.js';
export type DoUpdateIntermentDepthResponse = {
    success: boolean;
    intermentDepths: IntermentDepth[];
};
export default function handler(request: Request<unknown, unknown, UpdateIntermentDepthForm>, response: Response<DoUpdateIntermentDepthResponse>): void;
