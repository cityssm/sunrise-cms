import type { Request, Response } from 'express';
import type { directionsOfArrival } from '../../helpers/dataLists.js';
export type DoGetBurialSiteDirectionsOfArrivalResponse = {
    directionsOfArrival: Partial<Record<(typeof directionsOfArrival)[number], string>>;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
}>, response: Response<DoGetBurialSiteDirectionsOfArrivalResponse>): void;
