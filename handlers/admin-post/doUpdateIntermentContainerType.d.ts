import type { Request, Response } from 'express';
import { type UpdateIntermentContainerTypeForm } from '../../database/updateIntermentContainerType.js';
import type { IntermentContainerType } from '../../types/record.types.js';
export type DoUpdateIntermentContainerTypeResponse = {
    success: boolean;
    intermentContainerTypes: IntermentContainerType[];
};
export default function handler(request: Request<unknown, unknown, UpdateIntermentContainerTypeForm>, response: Response<DoUpdateIntermentContainerTypeResponse>): void;
