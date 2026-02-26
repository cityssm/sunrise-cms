import type { Request, Response } from 'express';
import type { ContractAttachment } from '../../types/record.types.js';
export interface UploadContractAttachmentForm {
    contractId: string;
    attachmentDetails?: string;
    attachmentTitle?: string;
}
export type DoUploadContractAttachmentResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    attachmentId: number;
    contractAttachments: ContractAttachment[];
};
export default function handler(request: Request<unknown, unknown, UploadContractAttachmentForm>, response: Response<DoUploadContractAttachmentResponse>): Promise<void>;
