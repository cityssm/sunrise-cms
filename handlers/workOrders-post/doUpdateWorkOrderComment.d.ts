import type { Request, Response } from 'express';
import { type UpdateWorkOrderCommentForm } from '../../database/updateWorkOrderComment.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderCommentForm & {
    workOrderId: string;
}>, response: Response): void;
