import type { Request, Response } from 'express';
import type { ContractAttachment } from '../../types/record.types.js';
export interface UpdateContractAttachmentForm {
    contractAttachmentId: string;
    attachmentTitle?: string;
    attachmentDetails?: string;
}
export type DoUpdateContractAttachmentResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractAttachments: ContractAttachment[];
};
export default function handler(request: Request<unknown, unknown, UpdateContractAttachmentForm>, response: Response<DoUpdateContractAttachmentResponse>): Promise<void>;
