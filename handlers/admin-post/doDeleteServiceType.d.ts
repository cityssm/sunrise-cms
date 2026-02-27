import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoDeleteServiceTypeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    serviceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    serviceTypeId: number | string;
}>, response: Response<DoDeleteServiceTypeResponse>): void;
