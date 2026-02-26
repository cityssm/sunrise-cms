import type { Request, Response } from 'express';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoDeleteBurialSiteTypeResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeId: string;
}>, response: Response<DoDeleteBurialSiteTypeResponse>): void;
