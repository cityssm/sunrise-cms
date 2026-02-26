import type { Request, Response } from 'express';
import { type AddBurialSiteTypeFieldForm } from '../../database/addBurialSiteTypeField.js';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoAddBurialSiteTypeFieldResponse = {
    success: true;
    burialSiteTypeFieldId: number;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>, response: Response<DoAddBurialSiteTypeFieldResponse>): void;
