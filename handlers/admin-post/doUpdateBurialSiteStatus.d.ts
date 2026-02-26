import type { Request, Response } from 'express';
import type { BurialSiteStatus } from '../../types/record.types.js';
export type DoUpdateBurialSiteStatusResponse = {
    success: boolean;
    burialSiteStatuses: BurialSiteStatus[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteStatusId: string;
    burialSiteStatus: string;
}>, response: Response<DoUpdateBurialSiteStatusResponse>): void;
