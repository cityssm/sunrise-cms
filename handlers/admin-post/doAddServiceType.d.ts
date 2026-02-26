import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoAddServiceTypeResponse = {
    success: true;
    serviceTypeId: number;
    serviceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    serviceType: string;
    orderNumber?: number | string;
}>, response: Response<DoAddServiceTypeResponse>): void;
