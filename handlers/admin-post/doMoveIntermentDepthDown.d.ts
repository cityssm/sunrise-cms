import type { Request, Response } from 'express';
import type { IntermentDepth } from '../../types/record.types.js';
export type DoMoveIntermentDepthDownResponse = {
    success: boolean;
    intermentDepths: IntermentDepth[];
};
export default function handler(request: Request<unknown, unknown, {
    intermentDepthId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveIntermentDepthDownResponse>): void;
