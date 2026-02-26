import type { Request, Response } from 'express';
import { type AddBurialSiteTypeForm } from '../../database/addBurialSiteType.js';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoAddBurialSiteTypeResponse = {
    success: true;
    burialSiteTypeId: number;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteTypeForm>, response: Response<DoAddBurialSiteTypeResponse>): void;
