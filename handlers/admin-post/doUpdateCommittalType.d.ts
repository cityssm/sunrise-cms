import type { Request, Response } from 'express';
import type { CommittalType } from '../../types/record.types.js';
export type DoUpdateCommittalTypeResponse = {
    success: boolean;
    committalTypes: CommittalType[];
};
export default function handler(request: Request<unknown, unknown, {
    committalType: string;
    committalTypeId: string;
}>, response: Response<DoUpdateCommittalTypeResponse>): void;
