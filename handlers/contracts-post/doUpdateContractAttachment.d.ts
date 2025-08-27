import type { Request, Response } from 'express';
export interface UpdateContractAttachmentForm {
    contractAttachmentId: string;
    attachmentTitle?: string;
    attachmentDetails?: string;
}
export default function handler(request: Request<unknown, unknown, UpdateContractAttachmentForm>, response: Response): Promise<void>;
