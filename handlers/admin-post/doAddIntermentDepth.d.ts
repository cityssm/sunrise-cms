import type { Request, Response } from 'express';
import { type AddIntermentDepthForm } from '../../database/addIntermentDepth.js';
import type { IntermentDepth } from '../../types/record.types.js';
export type DoAddIntermentDepthResponse = {
    success: true;
    intermentDepthId: number;
    intermentDepths: IntermentDepth[];
};
export default function handler(request: Request<unknown, unknown, AddIntermentDepthForm>, response: Response<DoAddIntermentDepthResponse>): void;
