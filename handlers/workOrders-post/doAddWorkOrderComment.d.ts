import type { Request, Response } from 'express';
import { type AddWorkOrderCommentForm } from '../../database/addWorkOrderComment.js';
import type { WorkOrderComment } from '../../types/record.types.js';
export type DoAddWorkOrderCommentResponse = {
    success: true;
    workOrderComments: WorkOrderComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderCommentForm>, response: Response<DoAddWorkOrderCommentResponse>): void;
