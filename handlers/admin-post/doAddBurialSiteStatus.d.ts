import type { Request, Response } from 'express';
import type { BurialSiteStatus } from '../../types/record.types.js';
export type DoAddBurialSiteStatusResponse = {
    success: true;
    burialSiteStatuses: BurialSiteStatus[];
    burialSiteStatusId: number;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteStatus: string;
    orderNumber?: number | string;
}>, response: Response<DoAddBurialSiteStatusResponse>): void;
