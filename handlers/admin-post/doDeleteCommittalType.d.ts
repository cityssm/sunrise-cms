import type { Request, Response } from 'express';
import type { CommittalType } from '../../types/record.types.js';
export type DoDeleteCommittalTypeResponse = {
    success: boolean;
    committalTypes: CommittalType[];
};
export default function handler(request: Request<unknown, unknown, {
    committalTypeId: string;
}>, response: Response<DoDeleteCommittalTypeResponse>): void;
