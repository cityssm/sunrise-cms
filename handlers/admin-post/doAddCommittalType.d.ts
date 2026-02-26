import type { Request, Response } from 'express';
import type { CommittalType } from '../../types/record.types.js';
export type DoAddCommittalTypeResponse = {
    success: true;
    committalTypeId: number;
    committalTypes: CommittalType[];
};
export default function handler(request: Request<unknown, unknown, {
    committalType: string;
    orderNumber?: number | string;
}>, response: Response<DoAddCommittalTypeResponse>): void;
