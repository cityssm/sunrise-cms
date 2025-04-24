import type { Request, Response } from 'express';
import { type UpdateBurialSiteCommentForm } from '../../database/updateBurialSiteComment.js';
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteCommentForm & {
    burialSiteId: string;
}>, response: Response): void;
