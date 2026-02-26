import type { Request, Response } from 'express';
import type { IntermentContainerType } from '../../types/record.types.js';
export type DoMoveIntermentContainerTypeUpResponse = {
    success: boolean;
    intermentContainerTypes: IntermentContainerType[];
};
export default function handler(request: Request<unknown, unknown, {
    intermentContainerTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveIntermentContainerTypeUpResponse>): void;
