import type { Request, Response } from 'express';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoUpdateBurialSiteTypeFieldResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request, response: Response<DoUpdateBurialSiteTypeFieldResponse>): void;
