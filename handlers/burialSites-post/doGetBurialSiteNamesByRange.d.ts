import type { Request, Response } from 'express';
import { type GetBurialSiteNamesByRangeForm, type GetBurialSiteNamesByRangeResult } from '../../database/getBurialSiteNamesByRange.js';
export type DoGetBurialSiteNamesByRangeResponse = {
    burialSiteNames: GetBurialSiteNamesByRangeResult;
    cemeteryId: number | string;
    burialSiteNameRangeLimit: number;
};
export default function handler(request: Request<unknown, unknown, GetBurialSiteNamesByRangeForm>, response: Response<DoGetBurialSiteNamesByRangeResponse>): void;
