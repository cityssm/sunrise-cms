import type { Request, Response } from 'express';
export type DoDeleteBurialSiteResponse = {
    success: boolean;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
}>, response: Response<DoDeleteBurialSiteResponse>): void;
