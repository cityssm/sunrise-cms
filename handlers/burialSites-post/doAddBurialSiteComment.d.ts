import type { Request, Response } from 'express';
import { type AddBurialSiteCommentForm } from '../../database/addBurialSiteComment.js';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoAddBurialSiteCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    burialSiteComments: BurialSiteComment[];
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteCommentForm>, response: Response<DoAddBurialSiteCommentResponse>): void;
