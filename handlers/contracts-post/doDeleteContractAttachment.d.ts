import type { Request, Response } from 'express';
export interface DeleteContractAttachmentForm {
    contractAttachmentId: string;
}
export default function handler(request: Request<unknown, unknown, DeleteContractAttachmentForm>, response: Response): Promise<void>;
