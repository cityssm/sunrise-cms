import type { Request, Response } from 'express';
import { type AddWorkOrderCommentForm } from '../../database/addWorkOrderComment.js';
export default function handler(request: Request<unknown, unknown, AddWorkOrderCommentForm>, response: Response): Promise<void>;
