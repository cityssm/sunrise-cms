import type { Request, Response } from 'express';
import type { BurialSiteTypeField } from '../../types/record.types.js';
export type DoGetBurialSiteTypeFieldsResponse = {
    burialSiteTypeFields: BurialSiteTypeField[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeId: string;
}>, response: Response<DoGetBurialSiteTypeFieldsResponse>): void;
