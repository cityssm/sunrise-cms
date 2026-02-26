import type { Request, Response } from 'express';
import { type UpdateBurialSiteCommentForm } from '../../database/updateBurialSiteComment.js';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoUpdateBurialSiteCommentResponse = {
    success: boolean;
    burialSiteComments: BurialSiteComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteCommentForm & {
    burialSiteId: string;
}>, response: Response<DoUpdateBurialSiteCommentResponse>): void;
