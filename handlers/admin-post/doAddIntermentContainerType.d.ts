import type { Request, Response } from 'express';
import { type AddIntermentContainerTypeForm } from '../../database/addIntermentContainerType.js';
import type { IntermentContainerType } from '../../types/record.types.js';
export type DoAddIntermentContainerTypeResponse = {
    success: true;
    intermentContainerTypeId: number;
    intermentContainerTypes: IntermentContainerType[];
};
export default function handler(request: Request<unknown, unknown, AddIntermentContainerTypeForm>, response: Response<DoAddIntermentContainerTypeResponse>): void;
