import type { Request, Response } from 'express';
import type { BurialSiteStatus } from '../../types/record.types.js';
export type DoMoveBurialSiteStatusUpResponse = {
    success: boolean;
    burialSiteStatuses: BurialSiteStatus[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteStatusId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveBurialSiteStatusUpResponse>): void;
