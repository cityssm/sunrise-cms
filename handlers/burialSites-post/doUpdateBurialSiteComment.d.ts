import type { Request, Response } from 'express';
import { type UpdateBurialSiteCommentForm } from '../../database/updateBurialSiteComment.js';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoUpdateBurialSiteCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    burialSiteComments: BurialSiteComment[];
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteCommentForm & {
    burialSiteId: string;
}>, response: Response<DoUpdateBurialSiteCommentResponse>): void;
