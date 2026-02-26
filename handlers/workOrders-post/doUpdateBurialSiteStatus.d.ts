import type { Request, Response } from 'express';
import type { BurialSite } from '../../types/record.types.js';
export type DoUpdateBurialSiteStatusResponse = {
    success: boolean;
    workOrderBurialSites: BurialSite[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    burialSiteStatusId: string;
    workOrderId: string;
}>, response: Response<DoUpdateBurialSiteStatusResponse>): void;
