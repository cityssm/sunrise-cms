import type { Request, Response } from 'express';
import type { IntermentContainerType } from '../../types/record.types.js';
export type DoDeleteIntermentContainerTypeResponse = {
    success: boolean;
    intermentContainerTypes: IntermentContainerType[];
};
export default function handler(request: Request<unknown, unknown, {
    intermentContainerTypeId: string;
}>, response: Response<DoDeleteIntermentContainerTypeResponse>): void;
