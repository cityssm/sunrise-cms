import type { Request, Response } from 'express';
export type DoDeleteBurialSiteResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
}>, response: Response<DoDeleteBurialSiteResponse>): void;
