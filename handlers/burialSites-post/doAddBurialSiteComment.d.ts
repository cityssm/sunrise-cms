import type { Request, Response } from 'express';
import { type AddBurialSiteCommentForm } from '../../database/addBurialSiteComment.js';
import type { BurialSiteComment } from '../../types/record.types.js';
export type DoAddBurialSiteCommentResponse = {
    success: true;
    burialSiteComments: BurialSiteComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteCommentForm>, response: Response<DoAddBurialSiteCommentResponse>): void;
