import type { Request, Response } from 'express';
import type { ContractAttachment } from '../../types/record.types.js';
export interface DeleteContractAttachmentForm {
    contractAttachmentId: string;
}
export type DoDeleteContractAttachmentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    contractAttachments: ContractAttachment[];
};
export default function handler(request: Request<unknown, unknown, DeleteContractAttachmentForm>, response: Response<DoDeleteContractAttachmentResponse>): Promise<void>;
