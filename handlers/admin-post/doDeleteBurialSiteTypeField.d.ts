import type { Request, Response } from 'express';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoDeleteBurialSiteTypeFieldResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeFieldId: string;
}>, response: Response<DoDeleteBurialSiteTypeFieldResponse>): void;
