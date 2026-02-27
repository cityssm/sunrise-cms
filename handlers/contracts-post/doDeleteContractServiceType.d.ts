import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoDeleteContractServiceTypeResponse = {
    success: false;
} | {
    success: true;
    contractServiceTypes: ServiceType[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: number | string;
    serviceTypeId: number | string;
}>, response: Response<DoDeleteContractServiceTypeResponse>): void;
