import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoUpdateContractServiceTypeResponse = {
    success: true;
    contractServiceTypes: ServiceType[];
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: number | string;
    serviceTypeId: number | string;
    contractServiceDetails?: string;
}>, response: Response<DoUpdateContractServiceTypeResponse>): void;
