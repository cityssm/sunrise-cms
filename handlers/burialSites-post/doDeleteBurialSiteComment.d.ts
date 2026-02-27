import type { Request, Response } from 'express';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoDeleteBurialSiteCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    burialSiteComments: BurialSiteComment[];
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteCommentId: string;
    burialSiteId: string;
}>, response: Response<DoDeleteBurialSiteCommentResponse>): void;
