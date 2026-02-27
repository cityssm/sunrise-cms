import type { Request, Response } from 'express';
import { type AddWorkOrderCommentForm } from '../../database/addWorkOrderComment.js';
import type { WorkOrderComment } from '../../types/record.types.js';
export type DoAddWorkOrderCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderComments: WorkOrderComment[];
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderCommentForm>, response: Response<DoAddWorkOrderCommentResponse>): void;
