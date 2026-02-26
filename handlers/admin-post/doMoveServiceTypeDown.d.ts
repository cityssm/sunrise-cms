import type { Request, Response } from 'express';
import type { ServiceType } from '../../types/record.types.js';
export type DoMoveServiceTypeDownResponse = {
    success: true;
    serviceTypes: ServiceType[];
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    serviceTypeId: number | string;
    moveToEnd?: '0' | '1';
}>, response: Response<DoMoveServiceTypeDownResponse>): void;
