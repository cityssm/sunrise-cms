import type { Request, Response } from 'express';
import type { IntermentDepth } from '../../types/record.types.js';
export type DoDeleteIntermentDepthResponse = {
    success: boolean;
    intermentDepths: IntermentDepth[];
};
export default function handler(request: Request<unknown, unknown, {
    intermentDepthId: string;
}>, response: Response<DoDeleteIntermentDepthResponse>): void;
