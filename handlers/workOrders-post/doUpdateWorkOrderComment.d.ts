import type { Request, Response } from 'express';
import { type UpdateWorkOrderCommentForm } from '../../database/updateWorkOrderComment.js';
import type { WorkOrderComment } from '../../types/record.types.js';
export type DoUpdateWorkOrderCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderComments: WorkOrderComment[];
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderCommentForm & {
    workOrderId: string;
}>, response: Response<DoUpdateWorkOrderCommentResponse>): void;
