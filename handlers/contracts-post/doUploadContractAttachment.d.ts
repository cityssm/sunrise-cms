import type { Request, Response } from 'express';
export interface UploadContractAttachmentForm {
    contractId: string;
    attachmentTitle?: string;
    attachmentDetails?: string;
}
export default function handler(request: Request<unknown, unknown, UploadContractAttachmentForm>, response: Response): Promise<void>;
