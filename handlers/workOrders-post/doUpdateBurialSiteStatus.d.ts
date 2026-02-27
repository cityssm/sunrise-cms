import type { Request, Response } from 'express';
import type { BurialSite } from '../../types/record.types.js';
export type DoUpdateBurialSiteStatusResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderBurialSites: BurialSite[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    burialSiteStatusId: string;
    workOrderId: string;
}>, response: Response<DoUpdateBurialSiteStatusResponse>): void;
