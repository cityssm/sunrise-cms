import type { Request, Response } from 'express';
import { type UpdateBurialSiteTypeForm } from '../../database/updateBurialSiteType.js';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoUpdateBurialSiteTypeResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteTypeForm>, response: Response<DoUpdateBurialSiteTypeResponse>): void;
