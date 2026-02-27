import type { Request, Response } from 'express';
export type DoUpdateBurialSiteLatitudeLongitudeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    burialSiteLatitude: string;
    burialSiteLongitude: string;
}>, response: Response<DoUpdateBurialSiteLatitudeLongitudeResponse>): void;
