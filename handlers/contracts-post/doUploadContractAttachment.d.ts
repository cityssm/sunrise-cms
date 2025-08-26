import type { Request, Response } from 'express';
export interface UploadContractAttachmentForm {
    contractId: string;
    attachmentDetails?: string;
    attachmentTitle?: string;
}
export default function handler(request: Request<unknown, unknown, UploadContractAttachmentForm>, response: Response): Promise<void>;
