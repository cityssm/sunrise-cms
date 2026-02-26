import type { Request, Response } from 'express';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoMoveBurialSiteTypeUpResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveBurialSiteTypeUpResponse>): void;
