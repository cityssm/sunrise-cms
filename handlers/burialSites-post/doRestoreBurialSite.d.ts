import type { Request, Response } from 'express';
export type DoRestoreBurialSiteResponse = {
    success: boolean;
    burialSiteId: number;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: number;
}>, response: Response<DoRestoreBurialSiteResponse>): void;
