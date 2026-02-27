import type { Request, Response } from 'express';
import type { WorkOrderComment } from '../../types/record.types.js';
export type DoDeleteWorkOrderCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    workOrderComments: WorkOrderComment[];
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderCommentId: string;
    workOrderId: string;
}>, response: Response<DoDeleteWorkOrderCommentResponse>): void;
