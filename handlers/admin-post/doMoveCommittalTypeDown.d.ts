import type { Request, Response } from 'express';
import type { CommittalType } from '../../types/record.types.js';
export type DoMoveCommittalTypeDownResponse = {
    success: boolean;
    committalTypes: CommittalType[];
};
export default function handler(request: Request<unknown, unknown, {
    committalTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveCommittalTypeDownResponse>): void;
