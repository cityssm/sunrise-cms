import type { Request, Response } from 'express';
import type { BurialSiteType } from '../../types/record.types.js';
export type DoMoveBurialSiteTypeFieldUpResponse = {
    success: boolean;
    burialSiteTypes: BurialSiteType[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeFieldId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveBurialSiteTypeFieldUpResponse>): void;
