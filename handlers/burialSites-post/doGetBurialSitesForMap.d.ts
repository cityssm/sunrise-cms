import type { Request, Response } from 'express';
import type { BurialSiteMapResult } from '../../database/getBurialSitesForMap.js';
export type DoGetBurialSitesForMapResponse = {
    errorMessage: string;
    success: false;
} | (BurialSiteMapResult & {
    success: true;
});
export default function handler(request: Request<unknown, unknown, {
    cemeteryId?: number | string;
}>, response: Response<DoGetBurialSitesForMapResponse>): void;
