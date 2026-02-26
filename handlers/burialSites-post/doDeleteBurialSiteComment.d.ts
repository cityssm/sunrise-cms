import type { Request, Response } from 'express';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoDeleteBurialSiteCommentResponse = {
    success: boolean;
    burialSiteComments: BurialSiteComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    burialSiteCommentId: string;
    burialSiteId: string;
}>, response: Response<DoDeleteBurialSiteCommentResponse>): void;
