import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoUpdateServiceTypeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    serviceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    serviceType: string;
    serviceTypeId: number | string;
}>, response: Response<DoUpdateServiceTypeResponse>): void;
