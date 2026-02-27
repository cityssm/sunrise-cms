import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoAddContractServiceTypeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractServiceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: number | string;
    serviceTypeId: number | string;
    contractServiceDetails?: string;
}>, response: Response<DoAddContractServiceTypeResponse>): void;
