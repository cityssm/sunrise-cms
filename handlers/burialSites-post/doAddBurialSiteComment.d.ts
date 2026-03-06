import type { Request, Response } from 'express';
import { type AddBurialSiteCommentForm } from '../../database/addBurialSiteComment.js';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoAddBurialSiteCommentResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    burialSiteComments: BurialSiteComment[];
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteCommentForm>, response: Response<DoAddBurialSiteCommentResponse>): void;
