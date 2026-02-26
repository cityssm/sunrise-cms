import type { Request, Response } from 'express';
import type { BurialSite } from '../../types/record.types.js';
export type DoDeleteWorkOrderBurialSiteResponse = {
    success: boolean;
    workOrderBurialSites: BurialSite[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    workOrderId: string;
}>, response: Response<DoDeleteWorkOrderBurialSiteResponse>): void;
