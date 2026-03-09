import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoAddServiceTypeResponse = {
    serviceTypeId: number;
    serviceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    orderNumber?: number | string;
    serviceType: string;
}>, response: Response<DoAddServiceTypeResponse>): void;
