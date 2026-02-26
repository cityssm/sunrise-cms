import type { Request, Response } from 'express';
export type DoGetFuneralDirectorsResponse = {
    success: true;
    funeralDirectorNames: string[];
};
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: string;
}>, response: Response<DoGetFuneralDirectorsResponse>): void;
