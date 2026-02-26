import type { Request, Response } from 'express';
import type { BurialSiteMapResult } from '../../database/getBurialSitesForMap.js';
export type DoGetBurialSitesForMapResponse = (BurialSiteMapResult & {
    success: true;
}) | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    cemeteryId?: number | string;
}>, response: Response<DoGetBurialSitesForMapResponse>): void;
